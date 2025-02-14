import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get length at date values
async function getLengthAtDate(): Promise<Array<any>> {
  try {
    const lengthAtDate = await knex<any>('lengthAtDate').select('*')
    return lengthAtDate
  } catch (error) {
    throw error
  }
}

export { getLengthAtDate }
