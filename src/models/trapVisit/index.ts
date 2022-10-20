import db from '../../db'
import { TrapVisit } from '../../interfaces'

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
    return { ...trapVisit[0], crew }
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
      /*
        environmental: {
          flowMeasure: {
            value: 1,
            unit: 'cfs'
          },
          waterTemperature: {
            value: 1,
            unit: 'F'
          }
        }
       */
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
