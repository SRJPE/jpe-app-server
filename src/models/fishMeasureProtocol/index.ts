import db from '../../db'
import { FishMeasureProtocol } from '../../interfaces'

const { knex } = db

// get fish measure protocol
async function getFishMeasureProtocol(
  programId
): Promise<FishMeasureProtocol[]> {
  try {
    const createdFishMeasureProtocol = await knex<FishMeasureProtocol>(
      'fishMeasureProtocol'
    )
      .select('*')
      .where('programId', programId)

    return createdFishMeasureProtocol
  } catch (error) {
    throw error
  }
}

// post trap location
async function postFishMeasureProtocol(
  fishMeasureProtocolValues
): Promise<FishMeasureProtocol[]> {
  try {
    const createdFishMeasureProtocol = await knex<FishMeasureProtocol>(
      'fishMeasureProtocol'
    ).insert(fishMeasureProtocolValues, ['*'])

    return createdFishMeasureProtocol
  } catch (error) {
    throw error
  }
}

async function updateFishMeasureProtocol({
  id,
  fishMeasureProtocolValues,
}): Promise<FishMeasureProtocol> {
  try {
    const updatedFishMeasureProtocol = await knex<FishMeasureProtocol>(
      'fishMeasureProtocol'
    )
      .where('id', id)
      .update(fishMeasureProtocolValues, ['*'])
    return updatedFishMeasureProtocol[0]
  } catch (error) {
    throw error
  }
}

export {
  getFishMeasureProtocol,
  postFishMeasureProtocol,
  updateFishMeasureProtocol,
}
