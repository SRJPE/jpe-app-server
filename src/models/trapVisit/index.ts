import db from '../../db'
import {
  TrapVisit,
  TrapVisitCrew,
  TrapVisitEnvironmental,
  TrapCoordinates,
  CatchRaw,
  ExistingMarksI,
  GeneticSamplingDataI,
  GeneticSamplingCrewI,
  MarkAppliedI,
  MarkAppliedCrewI,
  CatchFishConditionI,
  CatchRawConditionalValues,
} from '../../interfaces'
import { camelCase, keyBy } from 'lodash'
import { postTrapCoordinates } from './trapCoordinates'
import { postTrapVisitEnvironmental } from './trapVisitEnvironmental'

const { knex } = db

// get trap visit
async function getTrapVisit(trapVisitId: number | string): Promise<any> {
  try {
    const trapVisit = await knex<TrapVisit>('trapVisit')
      .select('*')
      .where('id', trapVisitId)

    const [trapVisitEnvironmentalData, crewData, coordinatesData] =
      await Promise.all([
        knex<any>('trapVisitEnvironmental')
          .select('*')
          .whereIn('trapVisitId', [trapVisitId]),
        knex<any>('trapVisitCrew')
          .select('*')
          .whereIn('trapVisitId', [trapVisitId]),
        knex<any>('trapCoordinates')
          .select('*')
          .whereIn('trapVisitId', [trapVisitId]),
      ])

    const personnelIds = crewData.map(row => row.personnelId)

    return {
      createdTrapVisitResponse: trapVisit[0],
      createdTrapVisitCrewResponse: personnelIds,
      createdTrapCoordinatesResponse: coordinatesData.length
        ? coordinatesData[0]
        : null,
      createdTrapVisitEnvironmentalResponse: trapVisitEnvironmentalData.length
        ? trapVisitEnvironmentalData
        : null,
    }
  } catch (error) {
    throw error
  }
}

async function getProgramTrapVisits(
  programId: number | string,
  allTime?: boolean
) {
  try {
    let query = knex<TrapVisit>('trapVisit')
      .select('*')
      .where('programId', programId)

    if (!allTime) {
      const pastYear = new Date()
      pastYear.setFullYear(pastYear.getFullYear() - 1)
      query = query.andWhere('created_at', '>=', pastYear)
    }

    const trapVisits = await query

    const trapVisitIds = trapVisits.map(trapVisit => trapVisit.id)

    const [trapVisitEnvironmentalData, crewData, coordinatesData] =
      await Promise.all([
        knex<any>('trapVisitEnvironmental')
          .select('*')
          .whereIn('trapVisitId', trapVisitIds),
        knex<any>('trapVisitCrew')
          .select('*')
          .whereIn('trapVisitId', trapVisitIds),
        knex<any>('trapCoordinates')
          .select('*')
          .whereIn('trapVisitId', trapVisitIds),
      ])

    const personnelIdsByTrapVisitId = crewData.reduce((acc, crewResponse) => {
      const trapVisitId = crewResponse.trapVisitId
      const personnelId = crewResponse.personnelId

      if (!acc[trapVisitId]) {
        acc[trapVisitId] = []
      }

      acc[trapVisitId].push(personnelId)
      return acc
    }, {})

    const environmentalByTrapVisitId = trapVisitEnvironmentalData.reduce(
      (acc, row) => {
        if (!acc[row.trapVisitId]) {
          acc[row.trapVisitId] = []
        }
        acc[row.trapVisitId].push(row)
        return acc
      },
      {}
    )

    const coordinatesByTrapVisitId = coordinatesData.reduce((acc, row) => {
      if (!acc[row.trapVisitId]) {
        acc[row.trapVisitId] = row
      }
      return acc
    }, {})

    const payload = trapVisits.map(trapVisit => {
      const trapVisitEnvironmental = environmentalByTrapVisitId[trapVisit.id] || []

      const personnelIds = personnelIdsByTrapVisitId[trapVisit.id] || null

      const coordinates = coordinatesByTrapVisitId[trapVisit.id] || null

      return {
        createdTrapVisitResponse: trapVisit,
        createdTrapVisitCrewResponse: personnelIds,
        createdTrapCoordinatesResponse: coordinates,
        createdTrapVisitEnvironmentalResponse: trapVisitEnvironmental.length
          ? trapVisitEnvironmental
          : null,
      }
    })

    return payload
  } catch (error) {
    throw error
  }
}

const postTrapVisit = async (trapVisit: Record<string, any>) => {
  try {
    if (Array.isArray(trapVisit)) {
      const results = await Promise.all(
        trapVisit.map(async trapVisitValue => {
          const result = createTrapVisit(trapVisitValue)
          return result
        })
      )
      return results
    } else if (typeof trapVisit === 'object') {
      const result = createTrapVisit(trapVisit)
      return result
    }
  } catch (error) {
    throw error
  }
}

// post trapVisit - admin only route
// trapVisitValues: Object representing 1 trap visit
async function createTrapVisit(trapVisitValues): Promise<{
  createdTrapVisitResponse: Array<TrapVisit>
  createdTrapVisitCrewResponse: Array<TrapVisitCrew>
}> {
  try {
    trapVisitValues.trapVisitTimeStart =
      trapVisitValues?.trapVisitTimeStart || null
    trapVisitValues.trapVisitTimeEnd = trapVisitValues?.trapVisitTimeEnd || null
    const trapVisitCrew = trapVisitValues.crew
    delete trapVisitValues.crew

    const trapCoordinates = trapVisitValues.trapCoordinates
    delete trapVisitValues.trapCoordinates

    const trapVisitEnvironmental = trapVisitValues.trapVisitEnvironmental
    delete trapVisitValues.trapVisitEnvironmental
    delete trapVisitValues.fieldsheetPage

    const createdTrapVisitResponse = await knex<TrapVisit>('trapVisit').insert(
      trapVisitValues,
      ['*']
    )

    const createdTrapVisit = createdTrapVisitResponse?.[0]

    // insert trapVisitEnvironmental
    const trapVisitEnvironmentalPayload = []

    trapVisitEnvironmental?.forEach(measureObject => {
      if (measureObject.measureValueNumeric === undefined) return

      trapVisitEnvironmentalPayload.push({
        trapVisitId: createdTrapVisit.id,
        ...measureObject,
      })
    })

    const createdTrapVisitEnvironmentalResponse =
      trapVisitEnvironmentalPayload.length
        ? await postTrapVisitEnvironmental(trapVisitEnvironmentalPayload)
        : null

    const visitCrewPromises = []
    trapVisitCrew.forEach(async crewMember => {
      const trapVisitCrewPayload = {
        personnelId: crewMember.personnelId,
        dataRecorder: crewMember.dataRecorder,
        fieldCheck: crewMember.fieldCheck,
        trapVisitId: createdTrapVisit.id,
      }
      visitCrewPromises.push(
        knex<TrapVisitCrew>('trapVisitCrew').insert(trapVisitCrewPayload, ['*'])
      )
    })

    return Promise.all(visitCrewPromises).then(response => {
      const crewIds = response.map(response => response[0].personnelId)
      return {
        createdTrapVisitResponse: createdTrapVisit,
        createdTrapVisitCrewResponse: crewIds,
        // createdTrapCoordinatesResponse,
        createdTrapVisitEnvironmentalResponse,
      }
    })
  } catch (error) {
    throw error
  }
}

function replaceNAWithNull(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replaceNAWithNull(item))
  }

  const newObj = {}
  for (let key in obj) {
    if (obj[key] === 'NA') {
      newObj[key] = null
    } else {
      newObj[key] = replaceNAWithNull(obj[key])
    }
  }
  return newObj
}

// PUT trapVisit - admin only route
async function putTrapVisit(
  trapVisitId: string,
  trapVisitValues: Record<string, any>
): Promise<TrapVisit> {
  const trapVisitValuesNoNull = replaceNAWithNull(trapVisitValues)

  try {
    if (trapVisitValuesNoNull.hasOwnProperty('createdTrapVisitCrewResponse')) {
      // delete all existing crew from trap visit
      await knex<TrapVisit>('trapVisitCrew')
        .where('trapVisitId', trapVisitId)
        .del()

      // insert new crew
      const rowsToInsert =
        trapVisitValuesNoNull.createdTrapVisitCrewResponse.map(personnelId => {
          return {
            personnelId,
            trapVisitId,
          }
        })
      await knex<TrapVisit>('trapVisitCrew').insert(rowsToInsert, ['*'])
      delete trapVisitValuesNoNull.createdTrapVisitCrewResponse
    }

    if (
      trapVisitValuesNoNull.hasOwnProperty(
        'createdTrapVisitEnvironmentalResponse'
      )
    ) {
      const envItems: Array<any> =
        trapVisitValuesNoNull.createdTrapVisitEnvironmentalResponse

      await Promise.all(
        envItems.map(async measure => {
          const { id, measureName, measureValueNumeric, measureValueText } =
            measure
          if (id) {
            await knex('trapVisitEnvironmental').where('id', id).update({
              measureValueNumeric,
              measureValueText,
            })
          } else {
            const existing = await knex('trapVisitEnvironmental')
              .where({ trapVisitId, measureName })
              .first()
            if (existing) {
              await knex('trapVisitEnvironmental')
                .where('id', existing.id)
                .update({ measureValueNumeric, measureValueText })
            } else {
              await knex('trapVisitEnvironmental').insert({
                trapVisitId,
                measureName,
                measureValueNumeric,
                measureValueText,
              })
            }
          }
        })
      )

      delete trapVisitValuesNoNull.createdTrapVisitEnvironmentalResponse
    }

    delete trapVisitValuesNoNull.createdTrapVisitResponse.id

    await knex<TrapVisit>('trapVisit')
      .where('id', trapVisitId)
      .update(trapVisitValuesNoNull.createdTrapVisitResponse, ['*'])

    const updatedTrapVisit = await getTrapVisit(trapVisitId)
    return updatedTrapVisit
  } catch (error) {
    throw error
  }
}

// DELETE trapVisit - cascades to every record owned by this visit:
// crew, environmental measures, coordinates, catch records, and everything
// hanging off those catch records (recaptures, marks applied, genetics,
// fish condition). Releases are NOT touched — they aren't owned by a trap
// visit (no trapVisitId column on `release`).
//
// Most of these FKs already CASCADE at the DB level (see catch_raw ->
// trap_visit, and existing_marks/genetic_sampling_data/mark_applied/
// catch_fish_condition -> catch_raw), but a few child tables use NO ACTION
// and would otherwise raise a FK violation, so we delete/unlink those
// explicitly before removing their parents. Everything runs in one
// transaction so a partial failure can't leave orphaned rows.
async function deleteTrapVisit(trapVisitId: number | string): Promise<{
  trapVisitId: number | string
  deletedCatchRawCount: number
}> {
  try {
    return await knex.transaction(async trx => {
      const catchRawRows = await trx<CatchRaw>('catchRaw')
        .select('id')
        .where('trapVisitId', trapVisitId)
      const catchRawIds = catchRawRows.map((r: any) => r.id)

      if (catchRawIds.length) {
        const markAppliedRows = await trx<MarkAppliedI>('markApplied')
          .select('id')
          .whereIn('catchRawId', catchRawIds)
        const markAppliedIds = markAppliedRows.map(r => r.id)

        const geneticSamplingRows = await trx<GeneticSamplingDataI>(
          'geneticSamplingData'
        )
          .select('id')
          .whereIn('catchRawId', catchRawIds)
        const geneticSamplingDataIds = geneticSamplingRows.map(r => r.id)

        if (geneticSamplingDataIds.length) {
          await trx<GeneticSamplingCrewI>('geneticSamplingCrew')
            .whereIn('geneticSamplingDataId', geneticSamplingDataIds)
            .del()
        }
        await trx<GeneticSamplingDataI>('geneticSamplingData')
          .whereIn('catchRawId', catchRawIds)
          .del()

        if (markAppliedIds.length) {
          // A recapture elsewhere in the system may reference the mark
          // applied here (fish marked on this visit, recaptured on another).
          // Unlink rather than delete so we don't destroy that other visit's
          // recapture record.
          await trx<ExistingMarksI>('existingMarks')
            .whereIn('markAppliedId', markAppliedIds)
            .update({ markAppliedId: null })

          await trx<MarkAppliedCrewI>('markAppliedCrew')
            .whereIn('markAppliedId', markAppliedIds)
            .del()
        }
        await trx<MarkAppliedI>('markApplied')
          .whereIn('catchRawId', catchRawIds)
          .del()

        // This visit's own recapture records (a fish caught here that carried
        // a mark from a prior release).
        await trx<ExistingMarksI>('existingMarks')
          .whereIn('catchRawId', catchRawIds)
          .del()

        await trx<CatchFishConditionI>('catchFishCondition')
          .whereIn('catchRawId', catchRawIds)
          .del()

        await trx<CatchRawConditionalValues>('catchRawConditionalValues')
          .whereIn('catchRawId', catchRawIds)
          .del()
      }

      await trx<CatchRaw>('catchRaw').where('trapVisitId', trapVisitId).del()
      await trx<TrapVisitCrew>('trapVisitCrew')
        .where('trapVisitId', trapVisitId)
        .del()
      await trx<TrapVisitEnvironmental>('trapVisitEnvironmental')
        .where('trapVisitId', trapVisitId)
        .del()
      await trx<TrapCoordinates>('trapCoordinates')
        .where('trapVisitId', trapVisitId)
        .del()

      const deleted = await trx<TrapVisit>('trapVisit')
        .where('id', trapVisitId)
        .del()

      if (!deleted) {
        throw new Error(`Trap visit ${trapVisitId} not found`)
      }

      return { trapVisitId, deletedCatchRawCount: catchRawIds.length }
    })
  } catch (error) {
    throw error
  }
}

export {
  getTrapVisit,
  getProgramTrapVisits,
  postTrapVisit,
  putTrapVisit,
  deleteTrapVisit,
}
