import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get visit types options
async function getVisitTypes(): Promise<Array<DropdownOption>> {
  try {
    const visitType = await knex<DropdownOption>('visitType').select('*')
    return visitType
  } catch (error) {
    throw error
  }
}

export { getVisitTypes }
