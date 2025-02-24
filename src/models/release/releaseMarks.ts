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
async function getReleaseMarks(): Promise<Array<ReleaseMarks>> {
  try {
    const releaseMarksRecords = await knex<ReleaseMarks>('ReleaseMarks')
      .select('releaseMarks.*', 'release.programId')
      .join('release', 'release.id', 'releaseMarks.releaseId')
      .orderBy('id', 'desc')
    return releaseMarksRecords
  } catch (error) {
    throw error
  }
}
export { postReleaseMarks, getReleaseMarks }
