import db from '../../db'
import { MarkAppliedI } from '../../interfaces'

const { knex } = db

async function postMarkApplied(
  MarkApplied: MarkAppliedI
): Promise<Array<MarkAppliedI>> {
  try {
    const createdMarkAppliedResponse = await knex<MarkAppliedI>(
      'markApplied'
    ).insert(MarkApplied, ['*'])

    return createdMarkAppliedResponse
  } catch (error) {
    throw error
  }
}

export { postMarkApplied }
