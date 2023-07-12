import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get funding Agency options
async function getListingUnitOptions(): Promise<Array<DropdownOption>> {
  try {
    const listingUnitOptions = await knex<DropdownOption>('listingUnit').select(
      '*'
    )
    return listingUnitOptions
  } catch (error) {
    throw error
  }
}

export { getListingUnitOptions }
