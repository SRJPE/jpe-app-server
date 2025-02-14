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

// get run options
async function getRunCodeMethods(): Promise<Array<DropdownOption>> {
  try {
    const runCodeMethods = await knex<DropdownOption>('runCodeMethod').select(
      '*'
    )
    return runCodeMethods
  } catch (error) {
    throw error
  }
}

export { getRuns, getRunCodeMethods }
