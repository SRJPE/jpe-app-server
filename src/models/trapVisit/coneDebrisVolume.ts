import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get fish processed options
async function getConeDebrisVolumeOptions(): Promise<Array<DropdownOption>> {
  try {
    const coneDebrisVolumeOptions = await knex<DropdownOption>(
      'coneDebrisVolume'
    ).select('*')
    return coneDebrisVolumeOptions
  } catch (error) {
    throw error
  }
}

export { getConeDebrisVolumeOptions }
