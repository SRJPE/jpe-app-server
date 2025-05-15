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
    const taxonAbbreviations = await knex('taxonAbbreviation')
      .join('taxon', 'taxon.code', '=', 'taxonAbbreviation.taxonCode')
      .select('taxonAbbreviation.*', 'taxon.commonname')

    const taxon = await knex('taxon').select('*')

    const taxonWithAbbreviations = taxon.reduce(
      (taxonArray, currentTaxonRecord) => {
        const taxonAbbreviationArray = taxonAbbreviations
          .filter(taxonAbbreviation => {
            return taxonAbbreviation.taxonCode === currentTaxonRecord.code
          })
          .map(abbr => abbr.abbreviationCode)

        currentTaxonRecord.taxonAbbreviations = taxonAbbreviationArray
        taxonArray.push(currentTaxonRecord)
        return taxonArray
      },
      []
    )

    return taxonWithAbbreviations
  } catch (error) {
    throw error
  }
}

export { getTaxon, getTaxonWithAbbreviations }
