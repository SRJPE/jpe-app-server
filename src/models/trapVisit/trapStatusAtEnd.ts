import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get fish processed options
async function getTrapStatusAtEnd(): Promise<Array<DropdownOption>> {
  try {
    const trapStatusAtEnd = await knex<DropdownOption>(
      'trapStatusAtEnd'
    ).select('*')
    return trapStatusAtEnd
  } catch (error) {
    throw error
  }
}

export { getTrapStatusAtEnd }
