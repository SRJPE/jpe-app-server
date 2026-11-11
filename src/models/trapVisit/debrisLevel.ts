import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get debris level options
async function getDebrisLevelOptions(): Promise<Array<DropdownOption>> {
  try {
    const debrisLevel = await knex<DropdownOption>('debrisLevel').select('*')
    return debrisLevel
  } catch (error) {
    throw error
  }
}

export { getDebrisLevelOptions }
