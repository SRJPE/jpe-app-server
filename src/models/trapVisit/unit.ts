import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get run options
async function getUnits(): Promise<Array<DropdownOption>> {
  try {
    const units = await knex<DropdownOption>('unit').select('*')
    return units
  } catch (error) {
    throw error
  }
}

export { getUnits }
