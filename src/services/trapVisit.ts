import { getTrapFunctionalities } from '../models/trapVisit/trapFunctionality'
import { getFishProcessedOptions } from '../models/trapVisit/fishProcessed'
import { getLifeStages } from '../models/trapVisit/lifeStage'
import { getMarkTypes } from '../models/trapVisit/markType'
import { getRuns } from '../models/trapVisit/run'
import { getUnits } from '../models/trapVisit/unit'
import { getMarkColors } from '../models/trapVisit/markColor'
import { getReleasePurposeOptions } from '../models/trapVisit/releasePurpose'
import { getVisitTypes } from '../models/trapVisit/visitType'
import { getPersonnelPrograms } from '../models/program'
import { getBodyParts } from '../models/trapVisit/bodyPart'
import { getPlusCountMethodology } from '../models/trapVisit/plusCountMethodology'

import db from '../db'
const { knex } = db

const getAllTrapVisitDropdowns = async () => {
  const dropdowns = {}
  const requestPromises = [
    getTrapFunctionalities(),
    getFishProcessedOptions(),
    getLifeStages(),
    getMarkTypes(),
    getMarkColors(),
    getBodyParts(),
    getRuns(),
    getUnits(),
    getReleasePurposeOptions(),
    getVisitTypes(),
    getPlusCountMethodology(),
  ]
  const keys = [
    'trapFunctionality',
    'fishProcessed',
    'lifeStage',
    'markType',
    'markColor',
    'bodyPart',
    'run',
    'unit',
    'releasePurpose',
    'visitType',
    'plusCountMethodology',
  ]

  const requestsResult = await Promise.allSettled(requestPromises)

  requestsResult.forEach((result, index) => {
    dropdowns[keys[index]] = result.status == 'fulfilled' ? result.value : []
  })

  return dropdowns
}

const getVisitSetupDefaultValues = async (personnelId: string) => {
  try {
    const programs = await getPersonnelPrograms(personnelId)
    const programIds = programs.map(program => program.programId)

    const trapLocations = await knex<any>('trapLocations')
      .select('*')
      .whereIn('programId', programIds)

    const crewMembers = await getDefaultCrewMembers(programIds)

    return {
      programs,
      trapLocations,
      crewMembers,
    }
  } catch (error) {
    throw error
  }
}

const getDefaultCrewMembers = async programIds => {
  try {
    const crew = await Promise.all(
      programIds.map(async programId => {
        let crew = []
        const existingTrapVisits = await knex<any>('trapVisit')
          .select('*')
          .where('programId', programId)
          .orderBy('trapVisitTimeStart', 'desc')

        if (existingTrapVisits.length) {
          crew = await knex<any>('trapVisitCrew')
            .join('personnel', 'personnel.id', 'trapVisitCrew.personnelId')
            .select('*')
            .where('trapVisitId', existingTrapVisits[0].id)
        } else {
          crew = await knex<any>('programPersonnelTeam')
            .select('*')
            .join(
              'personnel',
              'personnel.id',
              'programPersonnelTeam.personnelId'
            )
            .where('programId', programId)
        }

        return crew
      })
    )

    return crew
  } catch (error) {
    throw error
  }
}

export { getAllTrapVisitDropdowns, getVisitSetupDefaultValues }
