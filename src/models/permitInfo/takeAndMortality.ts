import db from '../../db'
import { TakeAndMortality } from '../../interfaces'

const { knex } = db

async function getPermitTakeAndMortality(
  permitInfoId: string | number
): Promise<TakeAndMortality[]> {
  try {
    const programPermits = await knex<TakeAndMortality>('takeAndMortality')
      .where('takeAndMortality.programId', permitInfoId)
      .select('*')
      .orderBy('takeAndMortality.id')

    return programPermits
  } catch (error) {
    throw error
  }
}

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

export { getPermitTakeAndMortality, postTakeAndMortality }
