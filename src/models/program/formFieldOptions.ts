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
 * Options for many form fields in ONE query, grouped in memory.
 *
 * Deliberately not a per-field lookup: getProgramFormFields runs inside
 * getPersonnelPrograms, which isAuthorized() calls on every authorized request.
 * A query per field would multiply that hot path.
 *
 * Returns {} for an empty/blank input so callers can attach `?? []` freely.
 */
async function getOptionsByFormFieldIds(
  formFieldIds: Array<number>
): Promise<Record<number, Array<FormFieldOption>>> {
  const ids = [...new Set((formFieldIds || []).filter(Boolean))]
  if (!ids.length) return {}

  try {
    const rows = await knex('formFieldOption')
      .select('id', 'formFieldId', 'definition')
      .whereIn('formFieldId', ids)
      .andWhere('active', true)
      // Raw fragment: knexSnakeCaseMappers does not rewrite raw SQL, so these
      // must be snake_case. NULLS LAST keeps un-ordered rows at the bottom.
      .orderByRaw('form_field_id, order_index NULLS LAST, id')

    return rows.reduce((acc, row) => {
      if (!acc[row.formFieldId]) acc[row.formFieldId] = []
      acc[row.formFieldId].push({ id: row.id, definition: row.definition })
      return acc
    }, {} as Record<number, Array<FormFieldOption>>)
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
 */
async function insertFormFieldOptions(
  formFieldId: number,
  definitions: Array<string>,
  trx: any = knex
): Promise<Array<FormFieldOption>> {
  if (!definitions.length) return []

  try {
    const inserted = await trx('formFieldOption').insert(
      definitions.map((definition, index) => ({
        formFieldId,
        definition,
        orderIndex: index,
        active: true,
      })),
      ['id', 'definition']
    )
    return inserted.map(({ id, definition }) => ({ id, definition }))
  } catch (error) {
    throw error
  }
}

/**
 * Replace a field's option set without hard-deleting.
 *
 * Survivors are reordered and kept (so their ids stay stable), new definitions
 * are inserted, and omitted ones are deactivated rather than dropped — a
 * retired option still explains historical trap_visit_environmental text.
 */
async function replaceFormFieldOptions({
  formFieldId,
  options,
}: {
  formFieldId: number
  options: any
}): Promise<Array<FormFieldOption>> {
  const definitions = normalizeOptions(options)

  try {
    await knex.transaction(async trx => {
      const existing = await trx('formFieldOption')
        .where({ formFieldId })
        .select('id', 'definition')

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
            { formFieldId, definition, orderIndex: index, active: true },
            ['id']
          )
          keptIds.push(created.id)
        }
      }

      // whereNotIn([]) matches everything, so guard with a sentinel.
      await trx('formFieldOption')
        .where({ formFieldId })
        .whereNotIn('id', keptIds.length ? keptIds : [-1])
        .update({ active: false })
    })

    const grouped = await getOptionsByFormFieldIds([formFieldId])
    return grouped[formFieldId] ?? []
  } catch (error) {
    throw error
  }
}

export {
  getOptionsByFormFieldIds,
  insertFormFieldOptions,
  normalizeOptions,
  replaceFormFieldOptions,
  OPTION_FIELD_TYPES,
}
