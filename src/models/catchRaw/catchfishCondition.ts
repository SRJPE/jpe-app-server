import db from '../../db'
import { CatchFishConditionI } from '../../interfaces'

const { knex } = db

async function postCatchFishCondition(
  catchFishCondition: CatchFishConditionI
): Promise<Array<CatchFishConditionI>> {
  try {
    const createdFishConditionCatchResponse = await knex<CatchFishConditionI>(
      'catchFishCondition'
    ).insert(catchFishCondition, ['*'])

    return createdFishConditionCatchResponse
  } catch (error) {
    throw error
  }
}

export { postCatchFishCondition }
