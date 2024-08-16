import db from '../../db'
import { TrapVisit, TrapVisitCrew } from '../../interfaces'
import { camelCase, keyBy } from 'lodash'
import { postTrapCoordinates } from './trapCoordinates'
import { postTrapVisitEnvironmental } from './trapVisitEnvironmental'

const { knex } = db

// get trap visit
async function getTrapVisit(trapVisitId: number | string): Promise<TrapVisit> {
  try {
    const trapVisit = await knex<TrapVisit>('trapVisit')
      .select('*')
      .where('id', trapVisitId)

    const crew = await knex<TrapVisit>('trapVisitCrew')
      .select('*')
      .where('trapVisitId', trapVisitId)
      .join('personnel', 'personnel.id', 'trapVisitCrew.personnelId')

    const environmentalResponse = await knex<TrapVisit>(
      'trapVisitEnvironmental'
    )
      .where('trapVisitId', trapVisitId)
      .join('unit', 'unit.id', 'trapVisitEnvironmental.measureUnit')
      .select(
        'trapVisitEnvironmental.*',
        'unit.definition as measureUnitDefinition'
      )

    const environmental = keyBy(environmentalResponse, obj => {
      return camelCase(obj.measureName)
    })

    return { ...trapVisit[0], crew, environmental }
  } catch (error) {
    throw error
  }
}

async function getProgramTrapVisits(programId: number | string) {
  try {
    // get current date, set year to previous year
    const pastYear = new Date()
    pastYear.setFullYear(pastYear.getFullYear() - 1)

    const trapVisits = await knex<TrapVisit>('trapVisit')
      .select('*')
      .where('programId', programId)
      .andWhere('created_at', '>=', pastYear)

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

    const payload = trapVisits.map(trapVisit => {
      const trapVisitEnvironmental = trapVisitEnvironmentalData.filter(
        row => row.trapVisitId === trapVisit.id
      )

      const personnelIds = personnelIdsByTrapVisitId[trapVisit.id] || null

      const coordinates =
        coordinatesData.find(row => row.trapVisitId === trapVisit.id) || null

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
    trapVisitValues.trapVisitTimeStart = trapVisitValues.trapVisitTimeStart
      ? new Date(trapVisitValues.trapVisitTimeStart)
      : null
    trapVisitValues.trapVisitTimeEnd = trapVisitValues.trapVisitTimeEnd
      ? new Date(trapVisitValues.trapVisitTimeEnd)
      : null
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

    // insert trapCoordinates
    const trapCoordinatesPayload = {
      trapVisitId: createdTrapVisit.id,
      trapLocationsId: trapVisitValues.trapLocationId,
      ...trapCoordinates,
    }
    const createdTrapCoordinatesResponse = await postTrapCoordinates(
      trapCoordinatesPayload
    )
    // insert trapVisitEnvironmental
    const trapVisitEnvironmentalPayload = trapVisitEnvironmental?.map(
      measureObject => {
        return {
          trapVisitId: createdTrapVisit.id,
          ...measureObject,
        }
      }
    )
    const createdTrapVisitEnvironmentalResponse =
      await postTrapVisitEnvironmental(trapVisitEnvironmentalPayload)

    const visitCrewPromises = []
    trapVisitCrew.forEach(async personnelId => {
      const trapVisitCrewPayload = {
        personnelId,
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
        createdTrapCoordinatesResponse,
        createdTrapVisitEnvironmentalResponse,
      }
    })
  } catch (error) {
    throw error
  }
}

// PUT trapVisit - admin only route
async function putTrapVisit(
  trapVisitId: string,
  trapVisitValues: Record<string, any>
): Promise<TrapVisit> {
  try {
    if (trapVisitValues.hasOwnProperty('crew')) {
      // delete all existing crew from trap visit
      await knex<TrapVisit>('trapVisitCrew')
        .where('trapVisitId', trapVisitId)
        .del()

      // insert new crew
      const rowsToInsert = trapVisitValues.crew.map(personnelId => {
        return {
          personnelId,
          trapVisitId,
        }
      })
      await knex<TrapVisit>('trapVisitCrew').insert(rowsToInsert, ['*'])
      delete trapVisitValues.crew
    }

    if (trapVisitValues.hasOwnProperty('environmental')) {
      const measureNames = Object.values(trapVisitValues.environmental).map(
        (measure: any) => measure.measureName
      )
      // delete existing records for measures for trap visit
      await knex<TrapVisit>('trapVisitEnvironmental')
        .whereIn('measureName', measureNames)
        .andWhere('trapVisitId', trapVisitId)
        .del()

      const rowsToInsert = Object.values(trapVisitValues.environmental).map(
        (environmentalObject: any) => {
          return {
            ...environmentalObject,
            trapVisitId,
          }
        }
      )
      await knex<TrapVisit>('trapVisitEnvironmental').insert(rowsToInsert, [
        '*',
      ])
      delete trapVisitValues.environmental
    }

    await knex<TrapVisit>('trapVisit')
      .where('id', trapVisitId)
      .update(trapVisitValues, ['*'])

    const updatedTrapVisit = await getTrapVisit(trapVisitId)
    return updatedTrapVisit
  } catch (error) {
    throw error
  }
}

export { getTrapVisit, getProgramTrapVisits, postTrapVisit, putTrapVisit }
