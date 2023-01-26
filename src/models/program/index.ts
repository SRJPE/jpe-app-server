import db from '../../db'
import { Program } from '../../interfaces'

const { knex } = db

async function getPersonnelPrograms(personnelId: string): Promise<any> {
  try {
    const programs = await knex<any>('programPersonnelTeam')
      .join('program', 'program.id', 'programPersonnelTeam.programId')
      .where('programPersonnelTeam.personnelId', personnelId)
      .select('*')
      .orderBy('program.id')
    return programs
  } catch (error) {
    throw error
  }
}

async function getAllPrograms(): Promise<any> {
  try {
    const programs = await knex<any>('program')
      .select('program.id as programId', 'program.*')
      .orderBy('program.id')
    return programs
  } catch (error) {
    throw error
  }
}

export { getPersonnelPrograms, getAllPrograms }
