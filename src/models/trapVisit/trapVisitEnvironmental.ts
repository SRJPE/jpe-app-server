import db from '../../db'
import { TrapVisitEnvironmental } from '../../interfaces'

const { knex } = db

async function postTrapVisitEnvironmental(
  trapVisitEnvironmental
): Promise<Array<TrapVisitEnvironmental>> {
  try {
    const createdTrapVisitEnvironmentalResponse =
      await knex<TrapVisitEnvironmental>('trapVisitEnvironmental').insert(
        trapVisitEnvironmental,
        ['*']
      )

    return createdTrapVisitEnvironmentalResponse
  } catch (error) {
    throw error
  }
}

async function putTrapVisitWaterTurbidity({ trapVisitId, waterTurbidity }) {
  try {
    const updatedTrapVisitEnvironmentalResponse =
      await knex<TrapVisitEnvironmental>('trapVisitEnvironmental')
        .where('trapVisitId', trapVisitId)
        .andWhere('measureName', 'water turbidity')
        .andWhere('measureValueNumeric', null)
        .update({
          measureValueNumeric: waterTurbidity,
          measureValueText: waterTurbidity,
        })

    return updatedTrapVisitEnvironmentalResponse
  } catch (error) {
    throw error
  }
}

export { postTrapVisitEnvironmental, putTrapVisitWaterTurbidity }
