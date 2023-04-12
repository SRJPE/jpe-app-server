import db from '../../db'
import { TrapVisitEnvironmental } from '../../interfaces'

const { knex } = db

async function postTrapVisitEnvironmental(
  trapVisitEnvironmental
): Promise<Array<TrapVisitEnvironmental>> {
  try {
    const createdTrapVisitEnvironmentalResponse =
      await knex<TrapVisitEnvironmental>('trapVisitEnvironmental').insert(
        trapVisitEnvironmental,
        ['*']
      )

    return createdTrapVisitEnvironmentalResponse
  } catch (error) {
    throw error
  }
}

export { postTrapVisitEnvironmental }
