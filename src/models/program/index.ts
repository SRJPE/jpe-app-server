import db from '../../db'
import {
  FishMeasureProtocol,
  HatcheryInfo,
  PermitInfo,
  Personnel,
  Program,
  TrapLocations,
} from '../../interfaces'
import { postFishMeasureProtocol } from '../fishMeasureProtocol'
import { postHatcheryInfo } from '../hatcheryInfo'
import { postPermitInfo } from '../permitInfo'
import { postPersonnel } from '../personnel'
import { postTrapLocations } from '../trapLocations'

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
    if (trappingSites.length > 0) {
      const trappingSitesPayload: TrapLocations = trappingSites.map(
        (trappingSite) => {
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
          const personnelPayload: Personnel = {
            programId: createdProgramId,
            ...crewMember,
          }
          const createdSinglePersonnelResponse = await postPersonnel(
            personnelPayload
          )
          createdPersonnelResponse.push(createdSinglePersonnelResponse[0])
        })
      )
    }

    // ===== hatcheryInfo (efficiencyTrialProtocols): // =====
    if (efficiencyTrialProtocols) {
      const hatcheryInfoPayload: HatcheryInfo = {
        programId: createdProgramId,
        ...efficiencyTrialProtocols,
      }
      createdHatcheryInfoResponse = await postHatcheryInfo(hatcheryInfoPayload)
    }

    // ===== fishMeasureProtocol: Trapping protocol // =====
    //species, lifeStage & run need to be filtered in the front.
    if (trappingProtocols && trappingProtocols.length > 0) {
      const fishMeasureProtocolPayload: FishMeasureProtocol =
        trappingProtocols.map((protocolObj) => {
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
    // take and mortality needs to be addressed
    if (permittingInformation) {
      const permitInfoPayload: PermitInfo = {
        programId: createdProgramId,
        ...permittingInformation,
      }
      //also posts expectedTakeAndMortality
      createdPermitInformationResponse = await postPermitInfo(permitInfoPayload)
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

export { getPersonnelPrograms, getAllPrograms, postProgram, updateProgram }
