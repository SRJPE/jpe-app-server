import db from '../../db'
import { Program } from '../../interfaces'

const { knex } = db

async function getPersonnelPrograms(personnelId: string): Promise<any> {
  try {
    const program = await knex<any>('programPersonnelTeam')
      .join('program', 'program.id', 'programPersonnelTeam.program')
      .join('trapLocations', 'trapLocations.programId', 'program.id')
      // .join('subsite', 'subsite.programId', 'program.id')
      .where('programPersonnelTeam.id', personnelId)
      .select('*')
    return program
  } catch (error) {
    throw error
  }
}

export { getPersonnelPrograms }
