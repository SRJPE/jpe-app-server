import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get fish processed options
async function getTaxon(): Promise<Array<DropdownOption>> {
  try {
    const taxon = await knex<DropdownOption>(
      'taxon'
    ).select('*')
    return taxon
  } catch (error) {
    throw error
  }
}

export { getTaxon }
