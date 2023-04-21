import db from '../../db'
import { GeneticSamplingDataI } from '../../interfaces'

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

export { postGeneticSamplingData }
