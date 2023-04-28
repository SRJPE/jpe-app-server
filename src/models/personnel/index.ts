import db from '../../db'
import { Personnel } from '../../interfaces'
import { postProgramPersonnelTeam } from '../programPersonnelTeam'

const { knex } = db

// GET
async function getPersonnel(id: number | string): Promise<Personnel> {
  try {
    const personnelRecords = await knex<Personnel>('personnel')
      .select('*')
      .where('id', id)

    return personnelRecords[0]
  } catch (error) {
    throw error
  }
}

// POST
async function postPersonnel(personnelValues): Promise<Personnel[]> {
  try {
    let programId = null
    if (personnelValues.programId) {
      programId = personnelValues.programId
      delete personnelValues.programId
    }

    const createdPersonnel = await knex<Personnel>('personnel').insert(
      personnelValues,
      ['*']
    )

    if (programId) {
      await Promise.all(
        createdPersonnel.map(async (personnel) => {
          let programPersonnel = await postProgramPersonnelTeam({
            programId,
            personnelId: personnel.id,
          })
          return programPersonnel
        })
      )
    }

    return createdPersonnel
  } catch (error) {
    throw error
  }
}

async function updatePersonnel({ id, personnelValues }): Promise<Personnel> {
  try {
    const updatedPersonnel = await knex<Personnel>('personnel')
      .where('id', id)
      .update(personnelValues, ['*'])
    return updatedPersonnel[0]
  } catch (error) {
    throw error
  }
}

export { getPersonnel, postPersonnel, updatePersonnel }
