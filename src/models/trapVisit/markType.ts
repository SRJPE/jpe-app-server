import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get mark types options
async function getMarkTypes(): Promise<Array<DropdownOption>> {
  try {
    const markType = await knex<DropdownOption>('markType').select('*')
    return markType
  } catch (error) {
    throw error
  }
}

export { getMarkTypes }
