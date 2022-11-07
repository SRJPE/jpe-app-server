import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get mark Colors options
async function getWhyTrapNotFunctioning(): Promise<Array<DropdownOption>> {
  try {
    const whyTrapNotFunctioning = await knex<DropdownOption>(
      'whyTrapNotFunctioning'
    ).select('*')
    return whyTrapNotFunctioning
  } catch (error) {
    throw error
  }
}

export { getWhyTrapNotFunctioning }
