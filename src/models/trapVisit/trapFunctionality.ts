import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get trap functionalities
async function getTrapFunctionalities(): Promise<Array<DropdownOption>> {
  try {
    const trapFunctionalities = await knex<DropdownOption>(
      'trapFunctionality'
    ).select('*')
    return trapFunctionalities
  } catch (error) {
    throw error
  }
}

export { getTrapFunctionalities }
