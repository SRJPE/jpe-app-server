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
async function getTaxonWithAbbreviations(): Promise<Array<any>> {
  try {
    const taxonAbbreviations = await knex('taxonAbbreviation').select('*')

    const taxon = await knex('taxon').select('*')

    const taxonAbbreviationMap = taxonAbbreviations.reduce((map, abbr) => {
      if (!map[abbr.taxonCode]) {
        map[abbr.taxonCode] = []
      }
      map[abbr.taxonCode].push(abbr.abbreviationCode)
      return map
    }, {} as Record<string, string[]>)

    const taxonWithAbbreviations = taxon.map(currentTaxonRecord => {
      currentTaxonRecord.taxonAbbreviations =
        taxonAbbreviationMap[currentTaxonRecord.code] || []
      return currentTaxonRecord
    })

    return taxonWithAbbreviations
  } catch (error) {
    throw error
  }
}

export { getTaxon, getTaxonWithAbbreviations }
