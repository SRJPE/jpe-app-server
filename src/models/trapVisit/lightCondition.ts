import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get light conditions options
async function getLightConditions(): Promise<Array<DropdownOption>> {
  try {
    const lightConditions = await knex<DropdownOption>('lightCondition').select(
      '*'
    )
    return lightConditions
  } catch (error) {
    throw error
  }
}

export { getLightConditions }
