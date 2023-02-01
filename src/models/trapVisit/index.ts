import db from '../../db'
import { TrapVisit, TrapVisitCrew } from '../../interfaces'
import { camelCase, keyBy } from 'lodash'

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
async function postTrapVisit(trapVisitValues): Promise<{
  createdTrapVisitResponse: Array<TrapVisit>
  createdTrapVisitCrewResponse: Array<TrapVisitCrew>
}> {
  try {
    const allTrapVisitCrews = []
    allTrapVisitCrews.push([...trapVisitValues.crew])
    delete trapVisitValues.crew
    const createdTrapVisitResponse = await knex<TrapVisit>('trapVisit').insert(
      trapVisitValues,
      ['*']
    )

    const allTrapVisitCrewPromises = []
    const createdTrapVisitCrewResponse = []

    createdTrapVisitResponse.forEach((trapVisit, idx) => {
      const visitCrewPromises = []
      allTrapVisitCrews[idx].forEach(async (personnelId) => {
        const trapVisitCrewPayload = {
          personnelId,
          trapVisitId: trapVisit.id,
        }
        visitCrewPromises.push(
          knex<TrapVisitCrew>('trapVisitCrew').insert(trapVisitCrewPayload, [
            '*',
          ])
        )
      })
      allTrapVisitCrewPromises.push(visitCrewPromises)
    })

    return Promise.all(
      allTrapVisitCrewPromises.map((visitCrewPromises) =>
        Promise.all(visitCrewPromises).then((response) => {
          console.log('response: ', response)
          const crewIds = response.map((response) => response[0].personnelId)
          createdTrapVisitCrewResponse.push(crewIds)
        })
      )
    ).then(() => {
      return { createdTrapVisitResponse, createdTrapVisitCrewResponse }
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
