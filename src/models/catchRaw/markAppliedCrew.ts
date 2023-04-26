import db from '../../db'
import { MarkAppliedCrewI } from '../../interfaces'

const { knex } = db

async function postMarkAppliedCrew(
  markAppliedCrew: MarkAppliedCrewI
): Promise<Array<MarkAppliedCrewI>> {
  try {
    const createdMarkAppliedCrewResponse = await knex<MarkAppliedCrewI>(
      'markAppliedCrew'
    ).insert(markAppliedCrew, ['*'])

    return createdMarkAppliedCrewResponse
  } catch (error) {
    throw error
  }
}

export { postMarkAppliedCrew }
