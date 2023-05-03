import db from '../../db'
import { ProgramPersonnelTeam } from '../../interfaces'

const { knex } = db

// get personnel associated with program
async function getProgramPersonnelTeam(
  programId: number | string
): Promise<ProgramPersonnelTeam[]> {
  try {
    const personnelRecords = await knex<ProgramPersonnelTeam>(
      'programPersonnelTeam'
    )
      .select('*')
      .where('program_id', programId)
      .join('personnel', 'personnel.id', 'programPersonnelTeam.personnelId')

    return personnelRecords
  } catch (error) {
    throw error
  }
}

// post program personnel
async function postProgramPersonnelTeam(
  programPersonnelValues
): Promise<ProgramPersonnelTeam[]> {
  try {
    const createdProgramPersonnel = await knex<ProgramPersonnelTeam>(
      'programPersonnelTeam'
    ).insert(programPersonnelValues, ['*'])

    return createdProgramPersonnel
  } catch (error) {
    throw error
  }
}

export { getProgramPersonnelTeam, postProgramPersonnelTeam }
