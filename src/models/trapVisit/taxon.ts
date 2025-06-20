import db from '../../db'
import { DropdownOption } from '../../interfaces'
import program from '../../routes/program'

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
    const results = await Promise.all(
      programIds?.map(async (programId: number) => {
        const result = await knex('taxon as t')
          .leftJoin(
            knex('taxon_abbreviation as ta')
              .join(
                'program_taxon_abbreviation as pta',
                'ta.id',
                'pta.taxon_abbreviation_id'
              )
              .where('pta.program_id', programId)
              .select('ta.*')
              .as('ta'),
            't.code',
            'ta.taxon_code'
          )
          .select('ta.abbreviation_code', 't.*')
        return result
      })
    )

    const resultsObj = {} as any

    programIds.forEach((programId: number, index: number) => {
      resultsObj[programId] = results[index]
    })

    return resultsObj
  } catch (error) {
    console.log('🚀 ~ taxon.ts:54 ~ getTaxonWithAbbreviations ~ error:', error)

    throw error
  }
}

export { getTaxon, getProgramTaxonAbbreviations }
