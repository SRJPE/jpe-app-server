import db from '../../db'
import { PermitInfo } from '../../interfaces'
import { postTakeAndMortality } from './takeAndMortality'

const { knex } = db

async function getProgramPermits(programId): Promise<PermitInfo[]> {
  try {
    const programPermits = await knex<PermitInfo>('permitInfo')
      .where('permitInfo.programId', programId)
      .select('*')
      .orderBy('permitInfo.id')

    return programPermits
  } catch (error) {
    throw error
  }
}

async function postPermitInfo(permitInfoValues): Promise<PermitInfo[]> {
  try {
    const {
      programId,
      streamName,
      permitStartDate,
      permitEndDate,
      flowThreshold,
      temperatureThreshold,
      frequencySamplingInclementWeather,
      expectedTakeAndMortality,
    } = permitInfoValues
    const permitInfoPayload = {
      programId,
      streamName,
      permitStartDate,
      permitEndDate,
      flowThreshold,
      temperatureThreshold,
      frequencySamplingInclementWeather,
    }
    const createdPermitInfo = await knex<PermitInfo>('permitInfo').insert(
      permitInfoPayload,
      ['*']
    )
    if (createdPermitInfo) {
      const expectedTakeAndMortalityPayload = expectedTakeAndMortality.map(
        (entry: any) => {
          return {
            permitInfoId: createdPermitInfo[0]?.id,
            ...entry,
          }
        }
      )

      await postTakeAndMortality(expectedTakeAndMortalityPayload)
    }

    return createdPermitInfo
  } catch (error) {
    throw error
  }
}

async function updatePermitInfo({ id, permitInfoValues }): Promise<PermitInfo> {
  try {
    const updatedPermitInfo = await knex<PermitInfo>('permitInfo')
      .where('id', id)
      .update(permitInfoValues, ['*'])
    return updatedPermitInfo[0]
  } catch (error) {
    throw error
  }
}

export { getProgramPermits, postPermitInfo, updatePermitInfo }
