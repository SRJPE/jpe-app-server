import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get mark Colors options
async function getWhyFishNotProcessedOptions(): Promise<Array<DropdownOption>> {
  try {
    const whyFishNotProcessed = await knex<DropdownOption>('whyFishNotProcessed').select('*')
    return whyFishNotProcessed
  } catch (error) {
    throw error
  }
}

export { getWhyFishNotProcessedOptions }
