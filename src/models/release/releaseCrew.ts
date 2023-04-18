import db from '../../db'
import { ReleaseCrew } from '../../interfaces'

const { knex } = db

async function postReleaseCrew(releaseCrew): Promise<Array<ReleaseCrew>> {
  try {
    const createdReleaseCrewResponse = await knex<ReleaseCrew>(
      'releaseCrew'
    ).insert(releaseCrew, ['*'])

    return createdReleaseCrewResponse
  } catch (error) {
    throw error
  }
}

export { postReleaseCrew }
