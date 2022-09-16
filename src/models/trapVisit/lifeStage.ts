import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get life stages options
async function getLifeStages(): Promise<Array<DropdownOption>> {
  try {
    const lifeStages = await knex<DropdownOption>('lifeStage').select('*')
    return lifeStages
  } catch (error) {
    throw error
  }
}

export { getLifeStages }
