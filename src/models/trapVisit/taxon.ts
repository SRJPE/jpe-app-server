import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get fish processed options
async function getTaxon(): Promise<Array<DropdownOption>> {
  try {
    const taxon = await knex<DropdownOption>('taxon').select('*')

    return taxon
  } catch (error) {
    throw error
  }
}

//get taxon abbreviations
async function getProgramTaxonAbbreviations(userId): Promise<Array<any>> {
  const userProgramsIds = await knex('programPersonnelTeam')
    .where('personnelId', userId)
    .select('programId')

  const programIds = userProgramsIds.map(row => row.programId)

  try {
    // const programTaxonAbbreviations = await knex('programTaxonAbbreviation')
    //   .join('program', 'program.id', 'programTaxonAbbreviation.programId')
    //   .join(
    //     'taxonAbbreviation',
    //     'taxonAbbreviation.id',
    //     'programTaxonAbbreviation.taxonAbbreviationId'
    //   )
    //   .fullOuterJoin('taxon', 'taxon.code', 'taxonAbbreviation.taxonCode')
    //   .select(
    //     'programTaxonAbbreviation.*',
    //     'taxon.commonname as commonname',
    //     'taxonAbbreviation.*'
    //   )

    // const programId = PASS IN PROGRAM ID AS ARG

    const results = await knex('taxon as t')
      .leftJoin(
        knex('taxon_abbreviation as ta')
          .join(
            'program_taxon_abbreviation as pta',
            'ta.id',
            'pta.taxon_abbreviation_id'
          )
          .select('ta.*', 'pta.program_id')
          .as('ta'),
        't.code',
        'ta.taxon_code'
      )
      .select('ta.abbreviation_code', 'ta.program_id', 't.*')

    // const taxon = await knex('taxon').select('*')

    // const taxonAbbreviationMap = taxonAbbreviations.reduce((map, abbr) => {
    //   if (!map[abbr.taxonCode]) {
    //     map[abbr.taxonCode] = []
    //   }
    //   map[abbr.taxonCode].push(abbr.abbreviationCode)
    //   return map
    // }, {} as Record<string, string[]>)

    // const taxonWithAbbreviations = taxon.map(currentTaxonRecord => {
    //   currentTaxonRecord.taxonAbbreviations =
    //     taxonAbbreviationMap[currentTaxonRecord.code] || []
    //   return currentTaxonRecord
    // })

    // return taxonWithAbbreviations
    return results
  } catch (error) {
    console.log('🚀 ~ taxon.ts:54 ~ getTaxonWithAbbreviations ~ error:', error)

    throw error
  }
}

export { getTaxon, getProgramTaxonAbbreviations }
