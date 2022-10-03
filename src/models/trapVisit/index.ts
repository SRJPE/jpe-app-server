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
  const createdCharterResponse = await knex<TrapVisit>('trapVisit').insert(
    trapVisitValues,
    ['id']
  )
  return createdCharterResponse[0]
}

export { getTrapVisit, postTrapVisit }
