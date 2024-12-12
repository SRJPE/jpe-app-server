import db from '../../db'
import { Personnel } from '../../interfaces'
import { postProgramPersonnelTeam } from '../programPersonnelTeam'

const { knex } = db

// GET by personnel id
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

//GET all personnel
async function getAllPersonnel(): Promise<Personnel[]> {
  try {
    const personnelRecords = await knex<Personnel>('personnel')
      .join('agency', 'personnel.agency_id', 'agency.id')
      .select(
        'personnel.*',
        'agency.id as agencyId',
        'agency.definition as agencyDefinition'
      )
    console.log(
      '🚀 ~ file: index.ts:24 ~ getAllPersonnel ~ personnelRecords:',
      personnelRecords
    )

    return personnelRecords
  } catch (error) {
    throw error
  }
}

// GET
async function getPersonnelByAzureUid(
  azureUid: number | string
): Promise<Personnel> {
  try {
    const personnelRecords = await knex<Personnel>('personnel')
      .join('agency', 'personnel.agency_id', 'agency.id')
      .select(
        'personnel.*',
        'agency.id as agencyId',
        'agency.definition as agencyDefinition'
      )
      .where('azureUid', azureUid)

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
        createdPersonnel.map(async personnel => {
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

async function updatePersonnel({
  azureUid,
  personnelValues,
}): Promise<Personnel> {
  try {
    const updatedPersonnel = await knex<Personnel>('personnel')
      .where('azure_uid', azureUid)
      .update(personnelValues, ['*'])
    return updatedPersonnel[0]
  } catch (error) {
    throw error
  }
}

export {
  getPersonnel,
  getAllPersonnel,
  getPersonnelByAzureUid,
  postPersonnel,
  updatePersonnel,
}
