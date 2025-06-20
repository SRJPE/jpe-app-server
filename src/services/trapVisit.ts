import { getTrapFunctionalities } from '../models/trapVisit/trapFunctionality'
import { getFishProcessedOptions } from '../models/trapVisit/fishProcessed'
import { getLifeStages } from '../models/trapVisit/lifeStage'
import { getMarkTypes } from '../models/trapVisit/markType'
import { getRuns, getRunCodeMethods } from '../models/trapVisit/run'
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
import {
  getTaxon,
  getProgramTaxonAbbreviations,
} from '../models/trapVisit/taxon'
import { getFishConditions } from '../models/trapVisit/fishCondition'
import { getReleaseMarks } from '../models/release/releaseMarks'
import { getFundingAgencyOptions } from '../models/program/agency'
import { getListingUnitOptions } from '../models/program/listingUnit'
import { getFrequencyOptions } from '../models/program/frequency'
import { getLengthAtDate } from '../models/trapVisit/lengthAtDate'
import {
  getConditionCodeOptions,
  getVegetationCodeOptions,
  getTideCodeOptions,
  getFlowDirectionOptions,
  getWeatherCodeOptions,
  getSubstrateOptions,
  getGearStatusOptions,
  getYsiNumOptions,
} from '../models/trapVisit/waterQuality'
const { knex } = db

const getAllTrapVisitDropdowns = async (userId: string) => {
  const dropdowns = {}
  const requestPromises = [
    getTrapFunctionalities(),
    getWhyTrapNotFunctioning(),
    getTrapStatusAtEnd(),
    getTaxon(),
    getProgramTaxonAbbreviations(userId),
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
    getReleaseMarks(),
    getFundingAgencyOptions(),
    getListingUnitOptions(),
    getFrequencyOptions(),
    getFishConditions(),
    getLengthAtDate(),
    getRunCodeMethods(),
    getConditionCodeOptions(),
    getVegetationCodeOptions(),
    getTideCodeOptions(),
    getFlowDirectionOptions(),
    getWeatherCodeOptions(),
    getSubstrateOptions(),
    getGearStatusOptions(),
    getYsiNumOptions(),
  ]
  const keys = [
    'trapFunctionality',
    'whyTrapNotFunctioning',
    'trapStatusAtEnd',
    'taxon',
    'programTaxonAbbreviation',
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
    'releaseMarks',
    'fundingAgency',
    'listingUnit',
    'frequency',
    'fishCondition',
    'lengthAtDate',
    'runCodeMethods',
    'conditionCode',
    'vegetationCode',
    'tideCode',
    'flowDirection',
    'weatherCode',
    'substrate',
    'gearStatus',
    'ysiNum',
  ]

  const requestsResult = await Promise.allSettled(requestPromises)

  requestsResult.forEach((result, index) => {
    dropdowns[keys[index]] = result.status == 'fulfilled' ? result.value : []
  })

  return dropdowns
}

// NOTE: Production functionality should filter visit setup default values
// by personnel Id of signed in user

const getVisitSetupDefaultValues = async (personnelId: string) => {
  try {
    const programs = await getPersonnelPrograms(personnelId)

    // const programs = await getAllPrograms()
    const programIds = programs.map(program => program.programId).sort()

    const trapLocations = await knex<any>('trapLocations')
      .select('*')
      .leftJoin('equipment', 'equipment.id', 'trapLocations.equipmentId')
      .select('trapLocations.*', 'equipment.definition')
      .orderBy('trapLocations.id')
      .whereIn('programId', programIds)

    const trapLocationIds = trapLocations.map(trapLocation => trapLocation.id)

    const releaseSites = await knex<any>('releaseSite')
      .join('trapLocations', 'trapLocations.id', 'releaseSite.trapLocationsId')
      .select('releaseSite.*', 'trapLocations.programId')
      .whereIn('trapLocationsId', trapLocationIds)

    const crewMembers = await getDefaultCrewMembers(programIds)

    const trapVisitCrew = await knex<any>('trapVisitCrew').select('*')

    const permitInfo = await knex<any>('permitInfo')
      .select('*')
      .whereIn('programId', programIds)

    return {
      programs,
      trapLocations,
      releaseSites,
      crewMembers,
      trapVisitCrew,
      permitInfo,
    }
  } catch (error) {
    console.log('error', error)
    throw error
  }
}

const getDefaultCrewMembers = async programIds => {
  try {
    const crew = await Promise.all(
      programIds.map(async programId => {
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
