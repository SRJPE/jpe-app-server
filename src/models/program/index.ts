import multer from 'multer'
import db from '../../db'
import {
  FishMeasureProtocol,
  HatcheryInfo,
  PermitInfo,
  Personnel,
  Program,
  TrapLocations,
} from '../../interfaces'
import {
  postFishMeasureProtocol,
  getFishMeasureProtocol,
} from '../fishMeasureProtocol'
import { postHatcheryInfo } from '../hatcheryInfo'
import { postPermitInfo } from '../permitInfo'
import { postPersonnel } from '../personnel'
import { postTrapLocations } from '../trapLocations'
import { BlobServiceClient } from '@azure/storage-blob'
import { postProgramPersonnelTeam } from '../programPersonnelTeam'
import { getProgramFormFields } from './formFields'

const { knex } = db

// get programs associated with personnel
async function getPersonnelPrograms(
  personnelId: string | number
): Promise<any> {
  try {
    const programs = (await knex<any>('programPersonnelTeam')
      .join('program', 'program.id', 'programPersonnelTeam.programId')
      .where('programPersonnelTeam.personnelId', personnelId)
      .select('*')
      .orderBy('program.id')) as Array<any>

    await Promise.all(
      programs.map(async program => {
        const [
          trapLocationsData,
          programPersonnelTeamData,
          hatcheryInfoData,
          fishMeasureProtocolData,
          formFieldsData,
        ] = await Promise.all([
          knex<any>('trapLocations')
            .where('programId', program.id)
            .leftJoin('equipment', 'equipment.id', 'trapLocations.equipmentId')
            .select('trapLocations.*', 'equipment.definition')
            .orderBy('trapLocations.id'),
          knex<any>('programPersonnelTeam')
            .join(
              'personnel',
              'personnel.id',
              'programPersonnelTeam.personnelId'
            )
            .where('programId', program.id)
            .select(
              'personnel.id',
              'personnel.firstName',
              'personnel.lastName',
              'personnel.email',
              'personnel.role',
              'personnel.agencyId'
            )
            .orderBy('id'),
          knex<any>('hatcheryInfo')
            .where('programId', program.id)
            .select('*')
            .orderBy('id'),
          getFishMeasureProtocol(program.id),
          getProgramFormFields(program.id),
        ])

        program['trappingSites'] = trapLocationsData
        program['crewMembers'] = programPersonnelTeamData
        program['hatcheryInfo'] = hatcheryInfoData
        program['fishMeasureProtocol'] = fishMeasureProtocolData
        program['programFormFields'] = formFieldsData
      })
    )
    return programs
  } catch (error) {
    console.log('errr', error)
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

async function postProgram(programValues): Promise<{
  createdProgramResponse: any
  createdTrappingSitesResponse: any
  createdPersonnelResponse: any
  createdHatcheryInfoResponse: any
  createdFishMeasureProtocolResponse: any
  createdPermitInformationResponse: any
}> {
  try {
    const {
      metaData,
      trappingSites,
      crewMembers,
      efficiencyTrialProtocols,
      trappingProtocols,
      permittingInformation,
    } = programValues

    let createdProgramResponse = []
    let createdTrappingSitesResponse = []
    let createdPersonnelResponse = []
    let createdHatcheryInfoResponse = []
    let createdFishMeasureProtocolResponse = []
    let createdPermitInformationResponse = []

    // ===== metaData: // =====
    createdProgramResponse = await knex<Program>('program').insert(metaData, [
      '*',
    ])

    const createdProgramId = createdProgramResponse[0]?.id

    // ===== trapLocation: // =====
    if (trappingSites && trappingSites.length > 0) {
      const trappingSitesPayload: TrapLocations = trappingSites.map(
        trappingSite => {
          return {
            programId: createdProgramId,
            ...trappingSite,
          }
        }
      )
      //also posts release Sites
      createdTrappingSitesResponse = await postTrapLocations(
        trappingSitesPayload
      )
    }

    // ===== personnel & programPersonnel// =====
    if (crewMembers && crewMembers.length > 0) {
      await Promise.all(
        crewMembers.map(async (crewMember: any) => {
          if (crewMember.id) {
            let postProgramPersonnel = await postProgramPersonnelTeam({
              programId: createdProgramId,
              personnelId: crewMember.id,
            })
          } else {
            const personnelPayload: Personnel = {
              programId: createdProgramId,
              ...crewMember,
            }
            const createdSinglePersonnelResponse = await postPersonnel(
              personnelPayload
            )
            createdPersonnelResponse.push(createdSinglePersonnelResponse[0])
          }
        })
      )
    }

    // ===== hatcheryInfo (efficiencyTrialProtocols): // =====
    if (efficiencyTrialProtocols && efficiencyTrialProtocols.length > 0) {
      await Promise.all(
        efficiencyTrialProtocols.map(async (efficiencyTrialObj: any) => {
          const hatcheryInfoPayload: HatcheryInfo = {
            programId: createdProgramId,
            ...efficiencyTrialObj,
          }
          const createdHatcheryInfo = await postHatcheryInfo(
            hatcheryInfoPayload
          )
          createdHatcheryInfoResponse.push(createdHatcheryInfo[0])
        })
      )
    }

    // ===== fishMeasureProtocol: Trapping protocol // =====
    if (trappingProtocols && trappingProtocols.length > 0) {
      const fishMeasureProtocolPayload: FishMeasureProtocol =
        trappingProtocols.map(protocolObj => {
          return {
            programId: createdProgramId,
            ...protocolObj,
          }
        })
      createdFishMeasureProtocolResponse = await postFishMeasureProtocol(
        fishMeasureProtocolPayload
      )
    }

    // ===== PermitInformation::: // =====
    if (permittingInformation && permittingInformation.length > 0) {
      await Promise.all(
        permittingInformation.map(async (permitInfoObj: any) => {
          const permitInfoPayload: PermitInfo = {
            programId: createdProgramId,
            ...permitInfoObj,
          }
          //also posts expectedTakeAndMortality
          const createdPermitInformation = await postPermitInfo(
            permitInfoPayload
          )
          createdPermitInformationResponse.push(createdPermitInformation[0])
        })
      )
    }

    return {
      createdProgramResponse: createdProgramResponse[0],
      createdTrappingSitesResponse,
      createdPersonnelResponse,
      createdHatcheryInfoResponse: createdHatcheryInfoResponse[0],
      createdFishMeasureProtocolResponse,
      createdPermitInformationResponse: createdPermitInformationResponse[0],
    }
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

async function postProgramFilesToAzure(file: Express.Multer.File) {
  const connectionStr = process.env.AZURE_STORAGE_CONNECTION_STRING

  if (!connectionStr) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not defined')
  }

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionStr)

  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobName = file.originalname + `_${new Date().getTime()}`

  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  const uploadBlobResponse = await blockBlobClient.upload(
    file.buffer,
    file.size
  )

  return uploadBlobResponse
}

export {
  getPersonnelPrograms,
  getAllPrograms,
  postProgram,
  updateProgram,
  postProgramFilesToAzure,
}
