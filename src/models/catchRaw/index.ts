import db from '../../db'
import { CatchRaw } from '../../interfaces'
import { camelCase, keyBy } from 'lodash'

const { knex } = db

async function getCatchRawRecord(
  catchRawId: number | string
): Promise<CatchRaw> {
  try {
    const catchRawRecords = await knex<CatchRaw>('catchRaw')
      .select('*')
      .where('id', catchRawId)

    return catchRawRecords[0]
  } catch (error) {
    throw error
  }
}

async function getTrapVisitCatchRawRecords(
  trapVisitId
): Promise<Array<CatchRaw>> {
  const catchRawRecords = await knex<CatchRaw>('catchRaw')
    .select('*')
    .where('trapVisitId', trapVisitId)

  return catchRawRecords
}

// post trapVisit - admin only route
// single object or array of objects

/*
[
  {
    trapVisit: 1,
    lifestage: fry,
    adClipped: false,
    dead: false,
    forkLength: 20
  },
  {
    trapVisit: 1,
    lifestage: fry,
    adClipped: false,
    dead: false,
    forkLength: 24,
  },
  {
    trapVisit: 1,
    lifestage: fry,
    adClipped: false,
    dead: false,
    forkLength: 22
  },
]


*/
async function postCatchRaw(catchRawValues): Promise<CatchRaw> {
  try {
    const createdTrapVisitResponse = await knex<CatchRaw>('catchRaw').insert(
      catchRawValues,
      ['*']
    )
    return createdTrapVisitResponse
  } catch (error) {
    throw error
  }
}

// PUT trapVisit - admin only route
async function putCatchRaw(
  catchRawId: string,
  catchRawValues: Record<string, any>
): Promise<CatchRaw> {
  try {
    return
  } catch (error) {
    throw error
  }
}

export {
  getCatchRawRecord,
  getTrapVisitCatchRawRecords,
  postCatchRaw,
  putCatchRaw,
}
