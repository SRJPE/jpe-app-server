import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get equipment options
async function getEquipment(): Promise<Array<DropdownOption>> {
  try {
    const equipmentOptions = await knex<DropdownOption>('equipment').select('*')
    return equipmentOptions
  } catch (error) {
    throw error
  }
}

export { getEquipment }
