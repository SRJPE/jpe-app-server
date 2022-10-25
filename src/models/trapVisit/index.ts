import db from '../../db'
import { TrapVisit } from '../../interfaces'
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

    const environmental = keyBy(environmentalResponse, obj => {
      return camelCase(obj.measureName)
    })

    console.log('envionrment', environmental)
    return { ...trapVisit[0], crew, environmental }
  } catch (error) {
    throw error
  }
}

// post trapVisit - admin only route
async function postTrapVisit(trapVisitValues): Promise<TrapVisit> {
  try {
    const createdTrapVisitResponse = await knex<TrapVisit>('trapVisit').insert(
      trapVisitValues,
      ['id']
    )
    return createdTrapVisitResponse[0]
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

export { getTrapVisit, postTrapVisit, putTrapVisit }

/*
  environmental: {
    flowMeasure: {
      measureName: 'Flow Measure' 
      measureValue: 1000,
      measureUnit: 5 // unit.id
    },
    waterTemperature: {
      measureName: 'Water Temperature'
      measureValue: 80,
      measureUnit: 1 // unit.id
    },
    waterTurbidity: {
      measureName: 'Water Turbidity'
      measureValue: 100,
      measureUnit: 25 // unit.id
    }
  }
*/
