import db from '../../db'
import { GeneticSamplingCrewI } from '../../interfaces'

const { knex } = db

async function postGeneticSamplingCrew(
  geneticSamplingCrew: GeneticSamplingCrewI
): Promise<Array<GeneticSamplingCrewI>> {
  try {
    const createdExistingMarksResponse = await knex<GeneticSamplingCrewI>(
      'geneticSamplingCrew'
    ).insert(geneticSamplingCrew, ['*'])

    return createdExistingMarksResponse
  } catch (error) {
    throw error
  }
}

export { postGeneticSamplingCrew }
