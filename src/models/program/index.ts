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
  getFishMeasureProtocol,
  postFishMeasureProtocol,
  updateFishMeasureProtocol,
} from '../fishMeasureProtocol'
import {
  getHatcheryInfo,
  postHatcheryInfo,
  updateHatcheryInfo,
} from '../hatcheryInfo'
import {
  getProgramPermits,
  postPermitInfo,
  updatePermitInfo,
} from '../permitInfo'
import { getPermitTakeAndMortality } from '../permitInfo/takeAndMortality'
import { postPersonnel, updatePersonnel } from '../personnel'
import { getProgramPersonnelTeam } from '../programPersonnelTeam'
import {
  getProgramTrapLocations,
  postTrapLocations,
  updateTrapLocations,
} from '../trapLocations'

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
    if (trappingSites && trappingSites.length > 0) {
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
    6

    // ===== fishMeasureProtocol: Trapping protocol // =====
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
async function getAllProgramRelatedContent(id: string | number): Promise<any> {
  try {
    const programMetaData = await knex<any>('program')
      .where('program.id', id)
      .select('*')
    const trappingSites = await getProgramTrapLocations(id)
    const personnel = await getProgramPersonnelTeam(id)
    const hatcheryInfo = await getHatcheryInfo(id)
    const fishMeasureProtocol = await getFishMeasureProtocol(id)
    const permitInformation = await getProgramPermits(id)
    const permitTakeAndMortality = await getPermitTakeAndMortality(id)
    return {
      programMetaData,
      trappingSites,
      personnel,
      hatcheryInfo,
      fishMeasureProtocol,
      permitInformation,
    }
  } catch (error) {
    throw error
  }
}
async function updateProgram({ id, updatedValues }): Promise<PermitInfo> {
  try {
    const {
      metaData,
      trappingSites,
      crewMembers: personnelValues,
      efficiencyTrialProtocols: hatcheryInfoValues,
      trappingProtocols: fishMeasureProtocolValues,
      permittingInformation: permitInfoValues,
    } = updatedValues

    /*
    First needs to check if the value is already present
    then if it is simply updateFishMeasureProtocol

    if not, insert postFishMeasureProtocol

    need to account for new lists of personnel, hatcheryInfo, fishMeasureProtocol, take and mortality
      this can lead to new relations


    */
    // ===== metaData: // =====
    const updatedPermitInfo = await knex<PermitInfo>('permitInfo')
      .where('id', id)
      .update(metaData, ['*'])
    // ===== trapLocation: // =====

    // ===== personnel & programPersonnel// =====
    updatePersonnel({ id, personnelValues })
    // ===== hatcheryInfo (efficiencyTrialProtocols): // =====
    updateHatcheryInfo({ id, hatcheryInfoValues })
    // ===== fishMeasureProtocol: Trapping protocol // =====
    updateFishMeasureProtocol({ id, fishMeasureProtocolValues })
    // ===== PermitInformation::: // =====
    updatePermitInfo({ id, permitInfoValues })

    //release
    //take and mort

    return updatedPermitInfo[0]
  } catch (error) {
    throw error
  }
}

async function upsertProgram({ id, updatedValues }): Promise<any> {
  const {
    metaData,
    trappingSites,
    crewMembers,
    efficiencyTrialProtocols,
    trappingProtocols,
    permittingInformation,
  } = updatedValues

  const trx = await knex.transaction()

  try {
    // Update or insert metadata
    let programId = id
    if (programId) {
      await trx<Program>('program').where('id', programId).update(metaData)
    } else {
      const [createdProgram] = await trx<Program>('program').insert(metaData, [
        'id',
      ])
      programId = createdProgram.id
    }

    // Update or insert trapping sites
    if (trappingSites && trappingSites.length > 0) {
      await Promise.all(
        trappingSites.map(async (site) => {
          if (site.id) {
            await trx<TrapLocations>('trapLocations')
              .where('id', site.id)
              .update(site)
          } else {
            await trx<TrapLocations>('trapLocations').insert({
              ...site,
              programId,
            })
          }
        })
      )
    }

    // add releaseSite related to trapLocations here

    // Update or insert personnel
    if (crewMembers && crewMembers.length > 0) {
      await Promise.all(
        crewMembers.map(async (member) => {
          if (member.id) {
            await trx<Personnel>('personnel')
              .where('id', member.id)
              .update(member)
          } else {
            await trx<Personnel>('personnel').insert({ ...member, programId })
          }
        })
      )
    }

    // Update or insert hatchery info
    if (efficiencyTrialProtocols && efficiencyTrialProtocols.length > 0) {
      await Promise.all(
        efficiencyTrialProtocols.map(async (protocol) => {
          if (protocol.id) {
            await trx<HatcheryInfo>('hatcheryInfo')
              .where('id', protocol.id)
              .update(protocol)
          } else {
            await trx<HatcheryInfo>('hatcheryInfo').insert({
              ...protocol,
              programId,
            })
          }
        })
      )
    }

    // Update or insert fish measure protocol
    if (trappingProtocols && trappingProtocols.length > 0) {
      await Promise.all(
        trappingProtocols.map(async (protocol) => {
          if (protocol.id) {
            await trx<FishMeasureProtocol>('fishMeasureProtocol')
              .where('id', protocol.id)
              .update(protocol)
          } else {
            await trx<FishMeasureProtocol>('fishMeasureProtocol').insert({
              ...protocol,
              programId,
            })
          }
        })
      )
    }

    // Update or insert permit information
    if (permittingInformation && permittingInformation.length > 0) {
      // await updatePermitInfo({ id: programId, permitInfoValues: permittingInformation })
      await Promise.all(
        permittingInformation.map(async (info) => {
          let createdPermitInfo
          if (info.id) {
            createdPermitInfo = await trx<PermitInfo>('permitInfo')
              .where('id', info.id)
              .update(info)
          } else {
            createdPermitInfo = await trx<PermitInfo>('permitInfo').insert({
              ...info,
              programId,
            })
          }

          // permittingInformation

          // Update or insert take and mortality
          if (
            info.expectedTakeAndMortality &&
            info.expectedTakeAndMortality.length > 0
          ) {
            await Promise.all(
              info.expectedTakeAndMortality.map(async (takeAndMortality) => {
                if (takeAndMortality.id) {
                  await trx<PermitInfo>('permitInfo')
                    .where('id', takeAndMortality.id)
                    .update(takeAndMortality)
                } else {
                  await trx<PermitInfo>('permitInfo').insert({
                    ...takeAndMortality,
                    programId,
                  })
                }
              })
            )
          }
        })
      )
    }

    //add the take and mortality related to permit information.

    // Commit transaction
    await trx.commit()

    return { success: true, programId }
  } catch (error) {
    // Rollback transaction
    await trx.rollback()
    throw error
  }
}

export {
  getPersonnelPrograms,
  getAllPrograms,
  postProgram,
  updateProgram,
  upsertProgram,
  getAllProgramRelatedContent,
}
