import db from '../../db'
import { CatchRawConditionalValues } from '../../interfaces'

const { knex } = db

async function postCatchRawConditionalValues(
  catchRawConditionalValues
): Promise<Array<CatchRawConditionalValues>> {
  try {
    const createdCatchRawConditionalValuesResponse =
      await knex<CatchRawConditionalValues>('catchRawConditionalValues').insert(
        catchRawConditionalValues,
        ['*']
      )

    return createdCatchRawConditionalValuesResponse
  } catch (error) {
    throw error
  }
}

export { postCatchRawConditionalValues }
