import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get fish processed options
async function getFishProcessedOptions(): Promise<Array<DropdownOption>> {
  try {
    const fishProcessedOptions = await knex<DropdownOption>(
      'fishProcessed'
    ).select('*')
    return fishProcessedOptions
  } catch (error) {
    throw error
  }
}

export { getFishProcessedOptions }
