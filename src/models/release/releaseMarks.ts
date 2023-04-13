import db from '../../db'
import { ReleaseMarks } from '../../interfaces'

const { knex } = db

async function postReleaseMarks(releaseMarks): Promise<Array<ReleaseMarks>> {
  try {
    const createdReleaseMarksResponse = await knex<ReleaseMarks>(
      'releaseMarks'
    ).insert(releaseMarks, ['*'])

    return createdReleaseMarksResponse
  } catch (error) {
    throw error
  }
}

export { postReleaseMarks }
