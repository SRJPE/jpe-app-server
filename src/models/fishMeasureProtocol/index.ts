import db from '../../db'
import { FishMeasureProtocol } from '../../interfaces'

const { knex } = db

// get fish measure protocol
async function getFishMeasureProtocol(
  programId
): Promise<FishMeasureProtocol[]> {
  try {
    const fishMeasureProtocolResults = await knex<any>('fishMeasureProtocol')
      .where('programId', programId)
      .join('taxon', 'taxon.code', 'fishMeasureProtocol.species')
      .leftJoin('lifeStage', 'lifeStage.id', 'fishMeasureProtocol.lifeStage')
      .leftJoin('run', 'run.id', 'fishMeasureProtocol.run')
      .select(
        'taxon.commonname',
        'lifeStage.definition as lifeStageName',
        'run.definition as runName',
        'fishMeasureProtocol.*'
      )
      .orderBy('id')

    return fishMeasureProtocolResults
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
