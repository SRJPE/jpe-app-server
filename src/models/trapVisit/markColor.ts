import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get mark Colors options
async function getMarkColors(): Promise<Array<DropdownOption>> {
  try {
    const markColor = await knex<DropdownOption>('markColor').select('*')
    return markColor
  } catch (error) {
    throw error
  }
}

export { getMarkColors }
