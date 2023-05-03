import db from '../../db'
import { ExistingMarksI } from '../../interfaces'

const { knex } = db

async function postExistingMarks(
  existingMarks: ExistingMarksI
): Promise<Array<ExistingMarksI>> {
  try {
    const createdExistingMarksResponse = await knex<ExistingMarksI>(
      'existingMarks'
    ).insert(existingMarks, ['*'])

    return createdExistingMarksResponse
  } catch (error) {
    throw error
  }
}

export { postExistingMarks }
