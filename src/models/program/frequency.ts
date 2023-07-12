import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get funding Agency options
async function getFrequencyOptions(): Promise<Array<DropdownOption>> {
  try {
    const frequencyOptions = await knex<DropdownOption>('frequency').select('*')
    return frequencyOptions
  } catch (error) {
    throw error
  }
}

export { getFrequencyOptions }
