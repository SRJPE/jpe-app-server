import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get body parts options
async function getBodyParts(): Promise<Array<DropdownOption>> {
  try {
    const bodyPart = await knex<DropdownOption>('bodyPart').select('*')
    return bodyPart
  } catch (error) {
    throw error
  }
}

export { getBodyParts }
