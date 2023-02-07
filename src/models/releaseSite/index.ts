import db from '../../db'
import { ReleaseSite } from '../../interfaces'

const { knex } = db

// get all release sites
async function getAllReleaseSites(): Promise<ReleaseSite[]> {
  try {
    const releaseSites = await knex<ReleaseSite>('releaseSite')
      .select('*')

    return releaseSites
  } catch (error) {
    throw error
  }
}

export { getAllReleaseSites }
