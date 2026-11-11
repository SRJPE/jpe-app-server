import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get length at date river values
async function getLengthAtDateRiver(): Promise<Array<any>> {
  try {
    const lengthAtDateRiver = await knex<any>('lengthAtDateRiver').select('*')
    return lengthAtDateRiver
  } catch (error) {
    throw error
  }
}

// get length at date delta values
async function getLengthAtDateDelta(): Promise<Array<any>> {
  try {
    const lengthAtDateDelta = await knex<any>('lengthAtDateDelta').select('*')
    return lengthAtDateDelta
  } catch (error) {
    throw error
  }
}

export { getLengthAtDateRiver, getLengthAtDateDelta }
