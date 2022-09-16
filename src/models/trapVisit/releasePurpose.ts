import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get release purpose options
async function getReleasePurposeOptions(): Promise<Array<DropdownOption>> {
  try {
    const releasePurposeOptions = await knex<DropdownOption>(
      'releasePurpose'
    ).select('*')
    return releasePurposeOptions
  } catch (error) {
    throw error
  }
}

export { getReleasePurposeOptions }
