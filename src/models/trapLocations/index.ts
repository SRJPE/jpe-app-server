import db from '../../db'
import { TrapLocations } from '../../interfaces'

const { knex } = db

// get trap locations for program
async function getProgramTrapLocations(programId): Promise<TrapLocations[]> {
  try {
    const programPermits = await knex<TrapLocations>('trapLocations')
      .where('trapLocations.programId', programId)
      .select('*')
      .orderBy('trapLocations.id')

    return programPermits
  } catch (error) {
    throw error
  }
}

// post trap location
async function postTrapLocations(
  trapLocationsValues
): Promise<TrapLocations[]> {
  try {
    const createdTrapLocations = await knex<TrapLocations>(
      'trapLocations'
    ).insert(trapLocationsValues, ['*'])

    return createdTrapLocations
  } catch (error) {
    throw error
  }
}

export { getProgramTrapLocations, postTrapLocations }
