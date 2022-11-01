import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get plus count methodology options
async function getPlusCountMethodology(): Promise<Array<DropdownOption>> {
  try {
    const bodyPart = await knex<DropdownOption>('plusCountMethodology').select(
      '*'
    )
    return bodyPart
  } catch (error) {
    throw error
  }
}

export { getPlusCountMethodology }
