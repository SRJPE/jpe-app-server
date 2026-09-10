import db from '../../db'

const { knex } = db

export interface FormFieldOption {
  id: number
  definition: string
}

// field_type_enum values whose choices come from form_field_option rows.
// 'multi-select' is accepted at the API layer even though the tablet cannot
// render it yet — storing its options now costs nothing and unblocks phase 2.
const OPTION_FIELD_TYPES = ['select', 'multi-select']

/**
 * Groups already-fetched form_field_option rows by formFieldId and, within
 * each group, dedupes by definition (case-insensitive) — a row scoped to
 * `forProgramId` always wins over a global (program_id IS NULL) row for the
 * same text, regardless of which order the rows arrived in. This is what
 * lets a program suppress a shared option (its own row, active:false) or
 * reorder one, without affecting any other program's view of the same field.
 *
 * Pure/in-memory on purpose: both the single-program and multi-program
 * fetchers below share this so there's exactly one place the override rule
 * is implemented.
 */
function mergeOptionRows(
  rows: Array<any>,
  forProgramId: number | string | null
): Record<number, Array<FormFieldOption>> {
  const relevant = rows.filter(
    row =>
      row.programId == null ||
      (forProgramId != null && String(row.programId) === String(forProgramId))
  )

  const byFormFieldId = new Map<number, Array<any>>()
  for (const row of relevant) {
    const list = byFormFieldId.get(row.formFieldId) ?? []
    list.push(row)
    byFormFieldId.set(row.formFieldId, list)
  }

  const result: Record<number, Array<FormFieldOption>> = {}
  for (const [formFieldId, fieldRows] of byFormFieldId) {
    const byDefinition = new Map<string, any>()
    for (const row of fieldRows) {
      const key = row.definition.toLowerCase()
      const existing = byDefinition.get(key)
      if (!existing || row.programId != null) byDefinition.set(key, row)
    }
    result[formFieldId] = Array.from(byDefinition.values())
      .filter(row => row.active)
      .map(row => ({ id: row.id, definition: row.definition }))
  }
  return result
}

/**
 * Options for many form fields in ONE query, grouped in memory, merging the
 * shared global option set (program_id IS NULL) with one program's own rows.
 * Pass no `programId` to get the global set only (e.g. the unscoped catalog
 * listing).
 *
 * Deliberately not a per-field lookup: getProgramFormFields runs inside
 * getPersonnelPrograms, which isAuthorized() calls on every authorized request.
 * A query per field would multiply that hot path.
 *
 * Returns {} for an empty/blank input so callers can attach `?? []` freely.
 */
async function getOptionsByFormFieldIds(
  formFieldIds: Array<number>,
  programId?: number | string | null
): Promise<Record<number, Array<FormFieldOption>>> {
  const ids = [...new Set((formFieldIds || []).filter(Boolean))]
  if (!ids.length) return {}

  try {
    let query = knex('formFieldOption')
      .select('id', 'formFieldId', 'definition', 'programId', 'active')
      .whereIn('formFieldId', ids)

    query =
      programId != null
        ? query.andWhere(function () {
            this.whereNull('programId').orWhere('programId', programId)
          })
        : query.whereNull('programId')

    const rows = await query.orderByRaw(
      // Raw fragment: knexSnakeCaseMappers does not rewrite raw SQL, so these
      // must be snake_case. NULLS LAST keeps un-ordered rows at the bottom.
      'form_field_id, order_index NULLS LAST, id'
    )

    return mergeOptionRows(rows, programId ?? null)
  } catch (error) {
    throw error
  }
}

/**
 * Same merge as getOptionsByFormFieldIds, but for EVERY one of a user's
 * programs in a single query — used by getPersonnelPrograms, which needs
 * every program's options fetched together (it runs on every authorized
 * request via isAuthorized()) and previously called getOptionsByFormFieldIds
 * with no programId at all, silently returning only the global option set
 * and hiding any program-scoped option (the default for every NEW custom
 * field since the form_field_option_program_scope migration).
 *
 * Returns Record<programId (as string), Record<formFieldId, options[]>>.
 */
async function getOptionsByFormFieldIdsForPrograms(
  formFieldIds: Array<number>,
  programIds: Array<number | string>
): Promise<Record<string, Record<number, Array<FormFieldOption>>>> {
  const ids = [...new Set((formFieldIds || []).filter(Boolean))]
  const progIds = [...new Set((programIds || []).filter(id => id != null))]
  if (!ids.length) return {}

  try {
    const rows = await knex('formFieldOption')
      .select('id', 'formFieldId', 'definition', 'programId', 'active')
      .whereIn('formFieldId', ids)
      .andWhere(function () {
        this.whereNull('programId')
        if (progIds.length) this.orWhereIn('programId', progIds)
      })
      .orderByRaw('form_field_id, order_index NULLS LAST, id')

    const result: Record<string, Record<number, Array<FormFieldOption>>> = {}
    for (const programId of progIds) {
      result[String(programId)] = mergeOptionRows(rows, programId)
    }
    return result
  } catch (error) {
    throw error
  }
}

/**
 * Trim, drop blanks, dedupe case-insensitively, and cap at the column width.
 * Accepts either raw strings or { definition } objects so the dashboard can
 * post whichever is convenient.
 */
function normalizeOptions(options: any): Array<string> {
  if (!Array.isArray(options)) return []

  const seen = new Set<string>()
  const normalized: Array<string> = []

  for (const option of options) {
    const definition = String(
      typeof option === 'string' ? option : option?.definition ?? ''
    )
      .trim()
      .slice(0, 100) // form_field_option.definition is VARCHAR(100)

    if (!definition) continue

    const key = definition.toLowerCase()
    if (seen.has(key)) continue

    seen.add(key)
    normalized.push(definition)
  }

  return normalized
}

/**
 * Bulk insert options for a field, ordered by array position.
 * Pass `trx` to enlist in a caller's transaction.
 *
 * `programId` is null by default (a shared/global option, per the
 * program_fields.equipmentId null-vs-specific convention). Pass a programId
 * to create the option as private to that program instead.
 */
async function insertFormFieldOptions(
  formFieldId: number,
  definitions: Array<string>,
  trx: any = knex,
  programId: number | string | null = null
): Promise<Array<FormFieldOption>> {
  if (!definitions.length) return []

  try {
    const inserted = await trx('formFieldOption').insert(
      definitions.map((definition, index) => ({
        formFieldId,
        definition,
        orderIndex: index,
        active: true,
        programId,
      })),
      ['id', 'definition']
    )
    return inserted.map(({ id, definition }) => ({ id, definition }))
  } catch (error) {
    throw error
  }
}

// A single-row query builder scoped to exactly the (formFieldId, programId)
// slice of form_field_option — null programId means the shared/global rows,
// never "every program's rows". Reused by replaceFormFieldOptions below so
// its "existing options" lookup and its "deactivate omitted ones" cleanup
// can never reach across program boundaries.
function scopedOptionsQuery(
  trx: any,
  formFieldId: number,
  programId: number | string | null
) {
  const query = trx('formFieldOption').where({ formFieldId })
  return programId != null
    ? query.andWhere('programId', programId)
    : query.whereNull('programId')
}

/**
 * Replace one (formFieldId, programId) option set without hard-deleting.
 *
 * Survivors are reordered and kept (so their ids stay stable), new definitions
 * are inserted, and omitted ones are deactivated rather than dropped — a
 * retired option still explains historical trap_visit_environmental text.
 *
 * `programId` null (default) operates on the shared/global option set only —
 * it can NEVER see or touch another program's rows for this field, and a
 * program-scoped call can never touch the global rows or another program's.
 *
 * Rejects fields where `isEnvironmentalField` is false — those are legacy,
 * seeded-before-the-dashboard selects (tideCode, gearStatus, weatherCode,
 * etc.) whose real choices live in dedicated FK'd lookup tables, not here.
 * postFormField always sets isEnvironmentalField: true for every field the
 * dashboard creates, so false/unset reliably marks one of those legacy
 * fields — writing options for one here would silently store data nothing
 * ever reads. The dashboard already gates on this client-side; this is the
 * server-side backstop for any other caller of this endpoint.
 */
async function replaceFormFieldOptions({
  formFieldId,
  options,
  programId = null,
}: {
  formFieldId: number
  options: any
  programId?: number | string | null
}): Promise<Array<FormFieldOption>> {
  const definitions = normalizeOptions(options)

  try {
    const field = await knex('formField')
      .where({ id: formFieldId })
      .first('id', 'isEnvironmentalField')

    if (!field) {
      const error: any = new Error('Form field not found.')
      error.status = 404
      throw error
    }
    if (!field.isEnvironmentalField) {
      const error: any = new Error(
        "This field's options are managed in a separate lookup table and can't be edited here."
      )
      error.status = 400
      throw error
    }

    await knex.transaction(async trx => {
      const existing = await scopedOptionsQuery(
        trx,
        formFieldId,
        programId
      ).select('id', 'definition')

      const byDefinition = new Map(
        existing.map((row: any) => [row.definition.toLowerCase(), row])
      )

      const keptIds: Array<number> = []

      for (let index = 0; index < definitions.length; index++) {
        const definition = definitions[index]
        const match: any = byDefinition.get(definition.toLowerCase())

        if (match) {
          await trx('formFieldOption')
            .where({ id: match.id })
            .update({ definition, orderIndex: index, active: true })
          keptIds.push(match.id)
        } else {
          const [created] = await trx('formFieldOption').insert(
            { formFieldId, definition, orderIndex: index, active: true, programId },
            ['id']
          )
          keptIds.push(created.id)
        }
      }

      // whereNotIn([]) matches everything, so guard with a sentinel.
      await scopedOptionsQuery(trx, formFieldId, programId)
        .whereNotIn('id', keptIds.length ? keptIds : [-1])
        .update({ active: false })
    })

    const grouped = await getOptionsByFormFieldIds([formFieldId], programId)
    return grouped[formFieldId] ?? []
  } catch (error) {
    throw error
  }
}

export {
  getOptionsByFormFieldIds,
  getOptionsByFormFieldIdsForPrograms,
  insertFormFieldOptions,
  normalizeOptions,
  replaceFormFieldOptions,
  OPTION_FIELD_TYPES,
}
