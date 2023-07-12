import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get funding Agency options
async function getFundingAgencyOptions(): Promise<Array<DropdownOption>> {
  try {
    const fundingAgencyOptions = await knex<DropdownOption>('agency').select(
      '*'
    )
    return fundingAgencyOptions
  } catch (error) {
    throw error
  }
}

export { getFundingAgencyOptions }
