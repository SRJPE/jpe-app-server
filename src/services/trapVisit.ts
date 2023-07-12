import { getTrapFunctionalities } from '../models/trapVisit/trapFunctionality'
import { getFishProcessedOptions } from '../models/trapVisit/fishProcessed'
import { getLifeStages } from '../models/trapVisit/lifeStage'
import { getMarkTypes } from '../models/trapVisit/markType'
import { getRuns } from '../models/trapVisit/run'
import { getUnits } from '../models/trapVisit/unit'
import { getMarkColors } from '../models/trapVisit/markColor'
import { getReleasePurposeOptions } from '../models/trapVisit/releasePurpose'
import { getVisitTypes } from '../models/trapVisit/visitType'
import { getPersonnelPrograms, getAllPrograms } from '../models/program'
import { getBodyParts } from '../models/trapVisit/bodyPart'
import { getPlusCountMethodology } from '../models/trapVisit/plusCountMethodology'
import db from '../db'
import { getWhyFishNotProcessedOptions } from '../models/trapVisit/whyFishNotProcessed'
import { getWhyTrapNotFunctioning } from '../models/trapVisit/whyTrapNotFunctioning'
import { getTrapStatusAtEnd } from '../models/trapVisit/trapStatusAtEnd'
import { getTaxon } from '../models/trapVisit/taxon'
import { getTwoMostRecentReleaseMarks } from '../models/release/releaseMarks'
import { getFundingAgencyOptions } from '../models/program/agency'
import { getListingUnitOptions } from '../models/program/listingUnit'
import { getFrequencyOptions } from '../models/program/frequency'
const { knex } = db

const getAllTrapVisitDropdowns = async () => {
  const dropdowns = {}
  const requestPromises = [
    getTrapFunctionalities(),
    getWhyTrapNotFunctioning(),
    getTrapStatusAtEnd(),
    getTaxon(),
    getFishProcessedOptions(),
    getWhyFishNotProcessedOptions(),
    getLifeStages(),
    getMarkTypes(),
    getMarkColors(),
    getBodyParts(),
    getRuns(),
    getUnits(),
    getReleasePurposeOptions(),
    getVisitTypes(),
    getPlusCountMethodology(),
    getTwoMostRecentReleaseMarks(),
    getFundingAgencyOptions(),
    getListingUnitOptions(),
    getFrequencyOptions(),
  ]
  const keys = [
    'trapFunctionality',
    'whyTrapNotFunctioning',
    'trapStatusAtEnd',
    'taxon',
    'fishProcessed',
    'whyFishNotProcessed',
    'lifeStage',
    'markType',
    'markColor',
    'bodyPart',
    'run',
    'unit',
    'releasePurpose',
    'visitType',
    'plusCountMethodology',
    'twoMostRecentReleaseMarks',
    'fundingAgency',
    'listingUnit',
    'frequency',
  ]

  const requestsResult = await Promise.allSettled(requestPromises)

  requestsResult.forEach((result, index) => {
    dropdowns[keys[index]] = result.status == 'fulfilled' ? result.value : []
  })

  return dropdowns
}

// NOTE: Production functionality should filter visit setup default values
// by personnel Id of signed in user

// for DEVELOPMENT, we will return all values
const getVisitSetupDefaultValues = async (personnelId: string) => {
  try {
    // const programs = await getPersonnelPrograms(personnelId)
    const programs = await getAllPrograms()
    const programIds = programs.map((program) => program.programId).sort()

    const trapLocations = await knex<any>('trapLocations')
      .select('*')
      .whereIn('programId', programIds)
    const releaseSites = await knex<any>('releaseSite').select('*')

    const crewMembers = await getDefaultCrewMembers(programIds)

    return {
      programs,
      trapLocations,
      releaseSites,
      crewMembers,
    }
  } catch (error) {
    throw error
  }
}

const getDefaultCrewMembers = async (programIds) => {
  try {
    const crew = await Promise.all(
      programIds.map(async (programId) => {
        let crew = await knex<any>('programPersonnelTeam')
          .select('*')
          .join('personnel', 'personnel.id', 'programPersonnelTeam.personnelId')
          .where('programId', programId)

        return crew
      })
    )

    return crew
  } catch (error) {
    throw error
  }
}

export { getAllTrapVisitDropdowns, getVisitSetupDefaultValues }
