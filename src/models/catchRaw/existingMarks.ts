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

async function getProgramExistingMarks(
  programId: number | string
): Promise<Array<ExistingMarksI>> {
  try {
    const existingMarksResponse = await knex<ExistingMarksI>('existingMarks')
      .select('*')
      .where('existingMarks.programId', programId)
      .join('release', 'release.id', 'existingMarks.releaseId')
      .join('catchRaw', 'catchRaw.id', 'existingMarks.catchRawId')
      .orderBy('existingMarks.id')

    return existingMarksResponse
  } catch (error) {
    throw error
  }
}

export { postExistingMarks, getProgramExistingMarks }
