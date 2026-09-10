import db from '../../db'

const { knex } = db

// substrate is form_field.id 12 — pilot for program-scoping the legacy
// select-type fields that predate form_field_option (tide_code, gear_status,
// etc.). program_lookup_settings is keyed by form_field_id generically so
// the same exclude-globals mechanism below can be reused for those fields
// without another migration, once this pilot proves out.
const SUBSTRATE_FORM_FIELD_ID = 12

export interface SubstrateOption {
  id: number
  code: string
  description: string
  programId: number | null
  active: boolean
}

/**
 * A program's effective substrate list: its own active rows, merged with
 * the shared/global set (program_id IS NULL) unless this program has opted
 * out of globals entirely via program_lookup_settings. Dedupes by
 * description (case-insensitive) — a program's own row always wins a tie
 * over a global one, mirroring form_field_option/taxon_abbreviation's
 * override rule.
 *
 * Fetches this program's own rows regardless of active status (not just
 * active=true) — an inactive own-row isn't just "this program's archived
 * custom option," it can also be a hide-a-default shadow (see
 * hideDefaultOption). Its text has to suppress the matching global row
 * even though the global itself is still active; filtering to active=true
 * before the merge would let the untouched global win instead of staying
 * hidden.
 */
async function getSubstrateOptions(
  programId: number | string
): Promise<Array<SubstrateOption>> {
  try {
    const setting = await knex('programLookupSettings')
      .where({ programId, formFieldId: SUBSTRATE_FORM_FIELD_ID })
      .first('excludeGlobalOptions')
    const excludeGlobal = setting?.excludeGlobalOptions ?? false

    const ownRows = await knex('substrate')
      .where({ programId })
      .select('id', 'code', 'description', 'programId', 'active')

    const suppressed = new Set(
      ownRows
        .filter((row: any) => !row.active)
        .map((row: any) => row.description.toLowerCase())
    )

    const globalRows = excludeGlobal
      ? []
      : await knex('substrate')
          .where({ programId: null, active: true })
          .select('id', 'code', 'description', 'programId')

    const visibleGlobals = globalRows.filter(
      (row: any) => !suppressed.has(row.description.toLowerCase())
    )
    const visibleOwn = ownRows.filter((row: any) => row.active)

    const byDescription = new Map<string, any>()
    for (const row of [...visibleGlobals, ...visibleOwn]) {
      const key = row.description.toLowerCase()
      const existing = byDescription.get(key)
      if (!existing || row.programId != null) byDescription.set(key, row)
    }

    return Array.from(byDescription.values())
      .map(row => ({
        id: row.id,
        code: row.code,
        description: row.description,
        programId: row.programId,
        active: true,
      }))
      .sort((a, b) => a.description.localeCompare(b.description))
  } catch (error) {
    throw error
  }
}

/**
 * Default options this program has individually hidden — inactive
 * program-owned rows whose text matches a currently-active global row.
 * Returned separately from getSubstrateOptions' merged list since inactive
 * rows are excluded from it entirely; a management UI needs this list to
 * offer "unhide."
 */
async function getHiddenDefaults(
  programId: number | string
): Promise<Array<SubstrateOption>> {
  try {
    const globals = await knex('substrate')
      .where({ programId: null, active: true })
      .select('description')
    const globalDescriptions = new Set(
      globals.map((g: any) => g.description.toLowerCase())
    )
    if (!globalDescriptions.size) return []

    const ownInactive = await knex('substrate')
      .where({ programId, active: false })
      .select('id', 'code', 'description', 'programId')

    return ownInactive
      .filter((row: any) => globalDescriptions.has(row.description.toLowerCase()))
      .map((row: any) => ({ ...row, active: false }))
      .sort((a: any, b: any) => a.description.localeCompare(b.description))
  } catch (error) {
    throw error
  }
}

/**
 * Suppress one specific global option for this program: clone it into a
 * program-owned row, inactive, so it drops out of THIS program's merged
 * list (getSubstrateOptions) while the original global row and every other
 * program's view stay completely untouched.
 *
 * Reuses an existing shadow row if one is already there from a previous
 * hide (rather than inserting a new one every time), so repeated
 * hide/unhide cycles on the same default never accumulate duplicate rows.
 */
async function hideDefaultOption({
  programId,
  globalOptionId,
}: {
  programId: number | string
  globalOptionId: number | string
}): Promise<SubstrateOption> {
  try {
    const global = await knex('substrate')
      .where({ id: globalOptionId })
      .first('id', 'code', 'description', 'programId')

    if (!global) {
      const error: any = new Error('Substrate option not found.')
      error.status = 404
      throw error
    }
    if (global.programId != null) {
      const error: any = new Error('That option is not a default option.')
      error.status = 400
      throw error
    }

    const existingShadow = await knex('substrate')
      .where({ programId })
      .whereRaw('lower(description) = lower(?)', [global.description])
      .first('id')

    if (existingShadow) {
      const [updated] = await knex('substrate')
        .where({ id: existingShadow.id })
        .update({ active: false }, ['id', 'code', 'description', 'programId', 'active'])
      return updated
    }

    const [created] = await knex('substrate').insert(
      {
        programId,
        code: global.code,
        description: global.description,
        active: false,
      },
      ['id', 'code', 'description', 'programId', 'active']
    )
    return created
  } catch (error) {
    throw error
  }
}

async function createSubstrateOption({
  programId,
  code,
  description,
}: {
  programId: number | string
  code: string
  description: string
}): Promise<SubstrateOption> {
  try {
    const [created] = await knex('substrate').insert(
      { programId, code, description, active: true },
      ['id', 'code', 'description', 'programId', 'active']
    )
    return created
  } catch (error) {
    throw error
  }
}

/**
 * Edit or archive (active: false) one of THIS program's own rows. Never a
 * hard delete — substrate is a literal FK target
 * (`trap_visit.substrate REFERENCES substrate`), so a row a real historical
 * trap_visit references can never be removed without violating that FK or
 * orphaning history.
 *
 * A global (program_id IS NULL) row can never be edited here — it's shared
 * by every program with no globals opt-out, so mutating it in place would
 * leak to all of them. A program that wants to change a global option's
 * text effectively creates its own replacement row instead (the dashboard
 * flow: archive the shadow of the global option, add a new one) — same
 * suppress-then-add pattern already used for form_field_option.
 */
async function updateSubstrateOption({
  id,
  programId,
  updatedValues,
}: {
  id: number | string
  programId: number | string
  updatedValues: { code?: string; description?: string; active?: boolean }
}): Promise<SubstrateOption> {
  try {
    const existing = await knex('substrate')
      .where({ id })
      .first('id', 'programId')

    if (!existing) {
      const error: any = new Error('Substrate option not found.')
      error.status = 404
      throw error
    }
    if (existing.programId == null) {
      const error: any = new Error(
        "This option is shared by every program and can't be edited — add your own instead."
      )
      error.status = 400
      throw error
    }
    if (String(existing.programId) !== String(programId)) {
      const error: any = new Error(
        'This option belongs to a different program.'
      )
      error.status = 403
      throw error
    }

    const [updated] = await knex('substrate')
      .where({ id })
      .update(updatedValues, ['id', 'code', 'description', 'programId', 'active'])
    return updated
  } catch (error) {
    throw error
  }
}

async function getExcludeGlobalOptions(
  programId: number | string
): Promise<boolean> {
  try {
    const row = await knex('programLookupSettings')
      .where({ programId, formFieldId: SUBSTRATE_FORM_FIELD_ID })
      .first('excludeGlobalOptions')
    return row?.excludeGlobalOptions ?? false
  } catch (error) {
    throw error
  }
}

async function setExcludeGlobalOptions({
  programId,
  exclude,
}: {
  programId: number | string
  exclude: boolean
}): Promise<boolean> {
  try {
    const existing = await knex('programLookupSettings')
      .where({ programId, formFieldId: SUBSTRATE_FORM_FIELD_ID })
      .first('id')

    if (existing) {
      await knex('programLookupSettings')
        .where({ id: existing.id })
        .update({ excludeGlobalOptions: exclude })
    } else {
      await knex('programLookupSettings').insert({
        programId,
        formFieldId: SUBSTRATE_FORM_FIELD_ID,
        excludeGlobalOptions: exclude,
      })
    }
    return exclude
  } catch (error) {
    throw error
  }
}

export {
  getSubstrateOptions,
  getHiddenDefaults,
  hideDefaultOption,
  createSubstrateOption,
  updateSubstrateOption,
  getExcludeGlobalOptions,
  setExcludeGlobalOptions,
  SUBSTRATE_FORM_FIELD_ID,
}
