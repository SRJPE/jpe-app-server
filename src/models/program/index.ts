import db from '../../db'
import { Program } from '../../interfaces'

const { knex } = db

// get programs associated with personnel
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

async function postProgram(programValues): Promise<any> {
  try {
    const createdProgramResponse = await knex<any>('program').insert(
      programValues,
      ['*']
    )
    return createdProgramResponse
  } catch (error) {
    throw error
  }
}

async function updateProgram({ id, updatedValues }): Promise<any> {
  try {
    const updatedProgramResponse = await knex<any>('program')
      .where({ id })
      .update(updatedValues, ['*'])
    return updatedProgramResponse[0]
  } catch (error) {
    throw error
  }
}

export { getPersonnelPrograms, getAllPrograms, postProgram, updateProgram }
