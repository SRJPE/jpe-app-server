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

    const environmental = keyBy(environmentalResponse, (obj) => {
      return camelCase(obj.measureName)
    })

    return { ...trapVisit[0], crew, environmental }
  } catch (error) {
    throw error
  }
}

// post trapVisit - admin only route
// trapVisitValues: Object representing 1 trap visit
async function postTrapVisit(trapVisitValues): Promise<{
  createdTrapVisitResponse: Array<TrapVisit>
  createdTrapVisitCrewResponse: Array<TrapVisitCrew>
}> {
  try {
    trapVisitValues.trapVisitTimeStart = new Date(
      trapVisitValues.trapVisitTimeStart
    )
    trapVisitValues.trapVisitTimeEnd = new Date(
      trapVisitValues.trapVisitTimeEnd
    )
    const trapVisitCrew = trapVisitValues.crew
    delete trapVisitValues.crew

    const trapCoordinates = trapVisitValues.trapCoordinates
    delete trapVisitValues.trapCoordinates

    const trapVisitEnvironmental = trapVisitValues.trapVisitEnvironmental
    delete trapVisitValues.trapVisitEnvironmental

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
    const trapVisitEnvironmentalPayload = trapVisitEnvironmental.map(
      (measureObject) => {
        return {
          trapVisitId: createdTrapVisit.id,
          ...measureObject,
        }
      }
    )
    const createdTrapVisitEnvironmentalResponse =
      await postTrapVisitEnvironmental(trapVisitEnvironmentalPayload)

    const visitCrewPromises = []
    trapVisitCrew.forEach(async (personnelId) => {
      const trapVisitCrewPayload = {
        personnelId,
        trapVisitId: createdTrapVisit.id,
      }
      visitCrewPromises.push(
        knex<TrapVisitCrew>('trapVisitCrew').insert(trapVisitCrewPayload, ['*'])
      )
    })

    return Promise.all(visitCrewPromises).then((response) => {
      const crewIds = response.map((response) => response[0].personnelId)
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
      const rowsToInsert = trapVisitValues.crew.map((personnelId) => {
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

export { getTrapVisit, postTrapVisit, putTrapVisit }
