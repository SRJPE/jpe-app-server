import db from '../../db'
import { TakeAndMortality } from '../../interfaces'

const { knex } = db

async function postTakeAndMortality(
  takeAndMortality
): Promise<Array<TakeAndMortality>> {
  try {
    const createdTakeAndMortalityResponse = await knex<TakeAndMortality>(
      'takeAndMortality'
    ).insert(takeAndMortality, ['*'])

    return createdTakeAndMortalityResponse
  } catch (error) {
    throw error
  }
}

export { postTakeAndMortality }
