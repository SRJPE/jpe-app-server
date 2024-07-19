import db from '../../db'
import { FishConditionDataI } from '../../interfaces'

const { knex } = db

async function postFishConditionData(
  fishConditionData: FishConditionDataI
): Promise<Array<FishConditionDataI>> {
  try {
    const createdFishConditionCatchResponse = await knex<FishConditionDataI>(
      'fishConditionData'
    ).insert(fishConditionData, ['*'])

    return createdFishConditionCatchResponse
  } catch (error) {
    throw error
  }
}

export { postFishConditionData }
