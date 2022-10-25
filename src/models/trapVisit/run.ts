import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get run options
async function getRuns(): Promise<Array<DropdownOption>> {
  try {
    const runs = await knex<DropdownOption>('run').select('*')
    return runs
  } catch (error) {
    throw error
  }
}

export { getRuns }
