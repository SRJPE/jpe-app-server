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

export { postGeneticSamplingData, getTakeOptions, getConditionOptions }
