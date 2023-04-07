import db from '../../db'
import { TrapCoordinates } from '../../interfaces'

const { knex } = db

async function postTrapCoordinates(trapCoordinates): Promise<TrapCoordinates> {
  try {
    const createdTrapCoordinatesResponse = await knex<TrapCoordinates>(
      'trapCoordinates'
    ).insert(trapCoordinates, ['*'])

    return createdTrapCoordinatesResponse[0]
  } catch (error) {
    throw error
  }
}

export { postTrapCoordinates }
