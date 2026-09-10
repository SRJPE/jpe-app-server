import db from '../../db'
import { GeneticSamplingDataI, GeneticSamplingCrewI } from '../../interfaces'

const { knex } = db

async function postGeneticSamplingData(
  geneticSamplingData: GeneticSamplingDataI
): Promise<Array<GeneticSamplingDataI>> {
  try {
    const createdExistingMarksResponse = await knex<GeneticSamplingDataI>(
      'geneticSamplingData'
    ).insert(geneticSamplingData, ['*'])

    return createdExistingMarksResponse
  } catch (error) {
    throw error
  }
}

async function getTakeOptions(): Promise<Array<any>> {
  try {
    const takeRecords = await knex<any>('take').select('*')
    return takeRecords
  } catch (error) {
    throw error
  }
}

async function getConditionOptions(): Promise<Array<any>> {
  try {
    const conditionRecords = await knex<any>('condition').select('*')
    return conditionRecords
  } catch (error) {
    throw error
  }
}

async function putGeneticSamplingData(
  geneticSamplingId: string,
  geneticSamplingObject: Record<string, any>
): Promise<any> {
  try {
    const samplingData = {
      ...geneticSamplingObject.createdGeneticSamplingDataResponse,
    }
    delete samplingData.id
    const updated = await knex<GeneticSamplingDataI>('geneticSamplingData')
      .where('id', geneticSamplingId)
      .update(samplingData, ['*'])
    return { createdGeneticSamplingDataResponse: updated[0] }
  } catch (error) {
    throw error
  }
}

// DELETE geneticSamplingData - cascades geneticSamplingCrew (NO ACTION FK,
// no CASCADE at the DB level).
async function deleteGeneticSamplingData(
  geneticSamplingId: string
): Promise<number> {
  try {
    return await knex.transaction(async trx => {
      await trx<GeneticSamplingCrewI>('geneticSamplingCrew')
        .where('geneticSamplingDataId', geneticSamplingId)
        .del()

      const deleted = await trx<GeneticSamplingDataI>('geneticSamplingData')
        .where('id', geneticSamplingId)
        .del()

      if (!deleted) {
        throw new Error(`Genetic sample ${geneticSamplingId} not found`)
      }

      return deleted
    })
  } catch (error) {
    throw error
  }
}

export {
  postGeneticSamplingData,
  putGeneticSamplingData,
  getTakeOptions,
  getConditionOptions,
  deleteGeneticSamplingData,
}
