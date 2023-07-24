import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get fish condition options
async function getFishConditions(): Promise<Array<DropdownOption>> {
  try {
    const fishCondition = await knex<DropdownOption>('fishCondition').select(
      '*'
    )
    return fishCondition
  } catch (error) {
    throw error
  }
}

export { getFishConditions }
