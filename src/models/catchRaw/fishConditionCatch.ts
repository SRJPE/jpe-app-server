import db from '../../db'
import { FishConditionCatchI } from '../../interfaces'

const { knex } = db

async function postFishConditionCatch(
  fishConditionCatch: FishConditionCatchI
): Promise<Array<FishConditionCatchI>> {
  try {
    const createdFishConditionCatchResponse = await knex<FishConditionCatchI>(
      'fishConditionCatch'
    ).insert(fishConditionCatch, ['*'])

    return createdFishConditionCatchResponse
  } catch (error) {
    throw error
  }
}

export { postFishConditionCatch }
