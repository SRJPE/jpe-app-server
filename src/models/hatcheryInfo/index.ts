import db from '../../db'
import { HatcheryInfo } from '../../interfaces'

const { knex } = db

// get hatchery info
async function getHatcheryInfo(programId): Promise<HatcheryInfo[]> {
  try {
    const hatcheryInfo = await knex<HatcheryInfo>('hatcheryInfo')
      .select('*')
      .where('program_id', programId)

      return hatcheryInfo
  } catch (error) {
    throw error
  }
}

// post hatchery info
async function postHatcheryInfo(hatcheryInfoValues): Promise<HatcheryInfo[]> {
  try {
    const createdHatcheryInfo = await knex<HatcheryInfo>('hatcheryInfo').insert(
      hatcheryInfoValues,
      ['*']
    )

    return createdHatcheryInfo
  } catch (error) {
    throw error
  }
}

export {getHatcheryInfo, postHatcheryInfo }
