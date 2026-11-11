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
import {
  getLengthAtDateRiver,
  getLengthAtDateDelta,
} from '../models/trapVisit/lengthAtDate'
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
import {
  getTakeOptions,
  getConditionOptions,
} from '../models/catchRaw/geneticSamplingData'
import { getDebrisLevelOptions } from '../models/trapVisit/debrisLevel'
import { getEquipment } from '../models/program/equipment'
const { knex } = db

const getAllTrapVisitDropdowns = async (userId: string) => {
  const requests = [
    { key: 'trapFunctionality', fn: getTrapFunctionalities() },
    { key: 'whyTrapNotFunctioning', fn: getWhyTrapNotFunctioning() },
    { key: 'trapStatusAtEnd', fn: getTrapStatusAtEnd() },
    { key: 'taxon', fn: getTaxon() },
    {
      key: 'programTaxonAbbreviation',
      fn: getProgramTaxonAbbreviations(userId),
    },
    { key: 'fishProcessed', fn: getFishProcessedOptions() },
    { key: 'whyFishNotProcessed', fn: getWhyFishNotProcessedOptions() },
    { key: 'lifeStage', fn: getLifeStages() },
    { key: 'markType', fn: getMarkTypes() },
    { key: 'markColor', fn: getMarkColors() },
    { key: 'bodyPart', fn: getBodyParts() },
    { key: 'run', fn: getRuns() },
    { key: 'unit', fn: getUnits() },
    { key: 'releasePurpose', fn: getReleasePurposeOptions() },
    { key: 'visitType', fn: getVisitTypes() },
    { key: 'plusCountMethodology', fn: getPlusCountMethodology() },
    { key: 'releaseMarks', fn: getReleaseMarks() },
    { key: 'fundingAgency', fn: getFundingAgencyOptions() },
    { key: 'listingUnit', fn: getListingUnitOptions() },
    { key: 'frequency', fn: getFrequencyOptions() },
    { key: 'fishCondition', fn: getFishConditions() },
    { key: 'lengthAtDateRiver', fn: getLengthAtDateRiver() },
    { key: 'lengthAtDateDelta', fn: getLengthAtDateDelta() },
    { key: 'runCodeMethods', fn: getRunCodeMethods() },
    { key: 'conditionCode', fn: getConditionCodeOptions() },
    { key: 'vegetationCode', fn: getVegetationCodeOptions() },
    { key: 'tideCode', fn: getTideCodeOptions() },
    { key: 'flowDirection', fn: getFlowDirectionOptions() },
    { key: 'weatherCode', fn: getWeatherCodeOptions() },
    { key: 'substrate', fn: getSubstrateOptions() },
    { key: 'gearStatus', fn: getGearStatusOptions() },
    { key: 'ysiNum', fn: getYsiNumOptions() },
    { key: 'take', fn: getTakeOptions() },
    { key: 'condition', fn: getConditionOptions() },
    { key: 'debrisLevel', fn: getDebrisLevelOptions() },
    { key: 'equipment', fn: getEquipment() },
  ]

  const results = await Promise.allSettled(requests.map(r => r.fn))

  return results.reduce(
    (dropdowns, result, index) => {
      dropdowns[requests[index].key] =
        result.status === 'fulfilled' ? result.value : []
      return dropdowns
    },
    {} as Record<string, Array<any>>
  )
}

// NOTE: Production functionality should filter visit setup default values
// by personnel Id of signed in user

const getVisitSetupDefaultValues = async (personnelId: string) => {
  try {
    const programs = await getPersonnelPrograms(personnelId)

    // const programs = await getAllPrograms()
    const programIds = programs.map(program => program.programId).sort()

    // const trapLocations = await knex<any>('trapLocations')
    //   .select('*')
    //   .leftJoin('equipment', 'equipment.id', 'trapLocations.equipmentId')
    //   .select('trapLocations.*', 'equipment.definition')
    //   .orderBy('trapLocations.id')
    //   .whereIn('programId', programIds)

    const trapLocations = await knex('trap_locations as tl')
      .select(
        'tl.*',
        'eq.definition',
        knex.raw(`
        COALESCE(
        (
          SELECT json_agg(taxon_sub_query ORDER BY taxon_sub_query.created_at DESC)
          FROM (
          SELECT *
          FROM (
            SELECT DISTINCT ON (cr.taxon_code)
            cr.taxon_code,
            t.commonname,
            ta.abbreviation_code,
            ta.is_full_name,
            cr.created_at
            FROM catch_raw cr
            JOIN trap_visit tv ON tv.id = cr.trap_visit_id
            JOIN taxon t ON t.code = cr.taxon_code

            LEFT JOIN LATERAL (
            SELECT ta.abbreviation_code, ta.is_full_name
            FROM program_taxon_abbreviation pta
            JOIN taxon_abbreviation ta
              ON ta.id = pta.taxon_abbreviation_id
            WHERE pta.program_id = tv.program_id
              AND ta.taxon_code = cr.taxon_code
            LIMIT 1
            ) ta ON TRUE

            WHERE tv.trap_location_id = tl.id
            ORDER BY cr.taxon_code, cr.created_at DESC
          ) distinct_taxa
          ORDER BY distinct_taxa.created_at DESC
          LIMIT 5
          ) taxon_sub_query
        ),
        '[]'
        ) as "recentSpecies"
      `)
      )
      .leftJoin('equipment as eq', 'eq.id', 'tl.equipment_id')
      .whereIn('tl.program_id', programIds)
      .orderBy('tl.id')

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
