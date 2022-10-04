import db from '../../db'
import { TrapVisit } from '../../interfaces'

const { knex } = db

// get trap visit
async function getTrapVisit(trapVisitId: number | string): Promise<TrapVisit> {
  try {
    const trapVisit = await knex<TrapVisit>('trapVisit')
      .select('*')
      .where('id', trapVisitId)
    return trapVisit[0]
  } catch (error) {
    throw error
  }
}

// post trapVisit - admin only route
async function postTrapVisit(trapVisitValues): Promise<TrapVisit> {
  const createdTrapVisitResponse = await knex<TrapVisit>('trapVisit').insert(
    trapVisitValues,
    ['id']
  )
  return createdTrapVisitResponse[0]
}

// PUT trapVisit - admin only route
async function putTrapVisit(
  trapVisitId: string,
  trapVisitValues: Record<string, any>
): Promise<TrapVisit> {
  const editedTrapVisitResponse = await knex<TrapVisit>('trapVisit')
    .where('id', trapVisitId)
    .update(trapVisitValues, ['*'])
  return editedTrapVisitResponse[0]
}

export { getTrapVisit, postTrapVisit, putTrapVisit }
