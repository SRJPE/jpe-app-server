import db from '../../db'

const { knex } = db

export interface ProgramTaxonAbbreviation {
  id: number
  programId: number
  taxonAbbreviationId: number
  taxonCode: string
  // Not camelCase in the DB (a raw `commonName VARCHAR(50)` column, unquoted
  // in the original create_tables.sql, so Postgres lowercased it with no
  // underscore) — knexSnakeCaseMappers can't round-trip this one, so every
  // query below selects/returns it as the literal lowercase name.
  commonname: string | null
  abbreviationCode: string
  isFullName: boolean
}

const JOINED_COLUMNS = [
  'pta.id',
  'pta.programId',
  'pta.taxonAbbreviationId',
  'ta.taxonCode',
  't.commonname',
  'ta.abbreviationCode',
  'ta.isFullName',
]

function joinedQuery(trx: any) {
  return trx('programTaxonAbbreviation as pta')
    .join('taxonAbbreviation as ta', 'ta.id', 'pta.taxonAbbreviationId')
    .join('taxon as t', 't.code', 'ta.taxonCode')
}

/**
 * One program's taxon abbreviations, joined for display/management — every
 * id a management UI needs to edit or delete a specific row.
 *
 * Distinct from getProgramTaxonAbbreviations (models/trapVisit/taxon.ts),
 * which powers the mobile dropdown for EVERY one of a user's programs at
 * once, with a left/inner join quirk for Butte-named programs (confirmed
 * intentional — do not touch that function or its query shape). This is a
 * plain inner join scoped to one program, for the Configuration Tables UI.
 */
async function getProgramTaxonAbbreviationsList(
  programId: number | string
): Promise<Array<ProgramTaxonAbbreviation>> {
  try {
    return await joinedQuery(knex)
      .where('pta.programId', programId)
      .select(JOINED_COLUMNS)
      .orderBy([{ column: 't.commonname' }, { column: 'ta.abbreviationCode' }])
  } catch (error) {
    throw error
  }
}

/**
 * Insert a NEW taxon_abbreviation row and link it to this program, in one
 * transaction. Never reused/deduped against an existing row with the same
 * text — no unique constraint by design (confirmed: a program can
 * legitimately have multiple abbreviation rows for the same species).
 */
async function createProgramTaxonAbbreviation({
  programId,
  taxonCode,
  abbreviationCode,
  isFullName = false,
}: {
  programId: number | string
  taxonCode: string
  abbreviationCode: string
  isFullName?: boolean
}): Promise<ProgramTaxonAbbreviation> {
  try {
    return await knex.transaction(async trx => {
      const [abbreviation] = await trx('taxonAbbreviation').insert(
        { taxonCode, abbreviationCode, isFullName },
        ['id']
      )
      const [link] = await trx('programTaxonAbbreviation').insert(
        { programId, taxonAbbreviationId: abbreviation.id },
        ['id']
      )
      const [row] = await joinedQuery(trx)
        .where('pta.id', link.id)
        .select(JOINED_COLUMNS)
      return row
    })
  } catch (error) {
    throw error
  }
}

/**
 * Edit one program's abbreviation.
 *
 * taxon_abbreviation rows are a SHARED catalog, not owned 1:1 by a program —
 * the seed data alone links the same row to three different programs (e.g.
 * id 1 "AMS" is used by programs 3, 4, and 5 at once). Mutating one in place
 * would silently leak the edit to every other program using it — the exact
 * cross-program leakage this whole initiative exists to prevent.
 *
 * So: only mutate the taxon_abbreviation row in place when this program is
 * its sole user. Otherwise fork — insert a new row with the edited values
 * and repoint just this program's link to it, leaving the shared row and
 * every other program's link completely untouched.
 */
async function updateProgramTaxonAbbreviation({
  id,
  programId,
  updatedValues,
}: {
  id: number | string
  programId: number | string
  updatedValues: {
    taxonCode?: string
    abbreviationCode?: string
    isFullName?: boolean
  }
}): Promise<ProgramTaxonAbbreviation> {
  try {
    return await knex.transaction(async trx => {
      const link = await trx('programTaxonAbbreviation')
        .where({ id })
        .first('id', 'programId', 'taxonAbbreviationId')

      if (!link) {
        const error: any = new Error('Taxon abbreviation not found.')
        error.status = 404
        throw error
      }
      if (String(link.programId) !== String(programId)) {
        const error: any = new Error(
          'This taxon abbreviation belongs to a different program.'
        )
        error.status = 403
        throw error
      }

      const current = await trx('taxonAbbreviation')
        .where({ id: link.taxonAbbreviationId })
        .first('taxonCode', 'abbreviationCode', 'isFullName')

      const nextValues = {
        taxonCode: updatedValues.taxonCode ?? current.taxonCode,
        abbreviationCode:
          updatedValues.abbreviationCode ?? current.abbreviationCode,
        isFullName: updatedValues.isFullName ?? current.isFullName,
      }

      const [{ count }] = await trx('programTaxonAbbreviation')
        .where({ taxonAbbreviationId: link.taxonAbbreviationId })
        .count('id as count')

      if (Number(count) <= 1) {
        await trx('taxonAbbreviation')
          .where({ id: link.taxonAbbreviationId })
          .update(nextValues)
      } else {
        const [forked] = await trx('taxonAbbreviation').insert(nextValues, [
          'id',
        ])
        await trx('programTaxonAbbreviation')
          .where({ id })
          .update({ taxonAbbreviationId: forked.id })
      }

      const [row] = await joinedQuery(trx).where('pta.id', id).select(JOINED_COLUMNS)
      return row
    })
  } catch (error) {
    throw error
  }
}

/**
 * Removes only this program's link — never the shared taxon_abbreviation
 * catalog row itself, which may still be used by other programs (or may
 * become unreferenced, which is harmless: nothing else stores
 * taxon_abbreviation_id anywhere. trap_visit/catch_raw reference taxon_code
 * directly, not this table, so unlike form_field_option there is no
 * historical-snapshot risk to guard against with a hard delete here).
 */
async function deleteProgramTaxonAbbreviation({
  id,
  programId,
}: {
  id: number | string
  programId: number | string
}): Promise<void> {
  try {
    const link = await knex('programTaxonAbbreviation')
      .where({ id })
      .first('id', 'programId')

    if (!link) {
      const error: any = new Error('Taxon abbreviation not found.')
      error.status = 404
      throw error
    }
    if (String(link.programId) !== String(programId)) {
      const error: any = new Error(
        'This taxon abbreviation belongs to a different program.'
      )
      error.status = 403
      throw error
    }

    await knex('programTaxonAbbreviation').where({ id }).del()
  } catch (error) {
    throw error
  }
}

export {
  getProgramTaxonAbbreviationsList,
  createProgramTaxonAbbreviation,
  updateProgramTaxonAbbreviation,
  deleteProgramTaxonAbbreviation,
}
