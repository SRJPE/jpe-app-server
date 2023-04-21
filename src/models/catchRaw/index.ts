import db from '../../db'
import {
  CatchRaw,
  ExistingMarksI,
  GeneticSamplingDataI,
} from '../../interfaces'
import { camelCase, keyBy } from 'lodash'
import { postExistingMarks } from './existingMarks'
import { postGeneticSamplingData } from './geneticSamplingData'

const { knex } = db

async function getCatchRawRecord(
  catchRawId: number | string
): Promise<CatchRaw> {
  try {
    const catchRawRecords = await knex<CatchRaw>('catchRaw')
      .select('*')
      .where('id', catchRawId)

    return catchRawRecords[0]
  } catch (error) {
    throw error
  }
}

async function getTrapVisitCatchRawRecords(
  trapVisitId
): Promise<Array<CatchRaw>> {
  const catchRawRecords = await knex<CatchRaw>('catchRaw')
    .select('*')
    .where('trapVisitId', trapVisitId)

  return catchRawRecords
}

// post trapVisit - admin only route
// single object or array of objects
async function postCatchRaw(catchRawValues): Promise<{
  createdCatchRawResponse: Array<CatchRaw>
  createdExistingMarksResponse: Array<ExistingMarksI>
  createdGeneticSamplingDataResponse: Array<GeneticSamplingDataI>
}> {
  try {
    const existingMarks = catchRawValues.existingMarks
    delete catchRawValues.existingMarks
    const geneticSamplingData = catchRawValues.geneticSamplingData
    delete catchRawValues.geneticSamplingData
    console.log('🚀 ~ postCatchRaw ~ geneticSamplingData:', geneticSamplingData)

    const createdCatchRawResponse = await knex<CatchRaw>('catchRaw').insert(
      catchRawValues,
      ['*']
    )
    const createdCatchRaw = createdCatchRawResponse?.[0]

    let createdExistingMarksResponse = []

    if (existingMarks.length > 0) {
      const existingMarksPayload = existingMarks.map((markObj: any) => {
        return {
          catchRawId: createdCatchRaw.id,
          programId: createdCatchRaw.programId,
          fishId: createdCatchRaw.taxonCode,
          createdAt: new Date(createdCatchRaw.createdAt),
          updatedAt: new Date(createdCatchRaw.updatedAt),
          ...markObj,
        }
      })

      createdExistingMarksResponse = await postExistingMarks(
        existingMarksPayload
      )
    }
    // let crewMemberCollectingSample: string //change to a forEach and set two variables.
    const geneticSamplingDataPayload = geneticSamplingData.map(
      (geneticSamplingObj: any) => {
        // crewMemberCollectingSample =
        //   geneticSamplingObj.crewMemberCollectingSample
        //do something with crewMemberCollectingSample before deletion??
        delete geneticSamplingObj.crewMemberCollectingSample
        delete geneticSamplingObj.UID

        return {
          catchRawId: createdCatchRaw.id,
          ...geneticSamplingObj,
        }
      }
    )
    console.log(
      '🚀 ~ postCatchRaw ~ geneticSamplingDataPayload:',
      geneticSamplingDataPayload
    )

    const createdGeneticSamplingDataResponse = await postGeneticSamplingData(
      geneticSamplingDataPayload
    )
    console.log(
      '🚀 ~ postCatchRaw ~ createdGeneticSamplingDataResponse:',
      createdGeneticSamplingDataResponse
    )

    //based on this createdGeneticSamplingDataResponse
    //I need to look over each object in the array
    //in each object I need to match the sampleID with the response sampleID

    return {
      createdCatchRawResponse,
      createdExistingMarksResponse,
      createdGeneticSamplingDataResponse,
    }
  } catch (error) {
    throw error
  }
}

// PUT trapVisit - admin only route
async function putCatchRaw(
  catchRawId: string,
  catchRawValues: Record<string, any>
): Promise<CatchRaw> {
  try {
    const updatedCatchRawRecord = await knex<CatchRaw>('catchRaw')
      .where('id', catchRawId)
      .update(catchRawValues, ['*'])
    return updatedCatchRawRecord[0]
  } catch (error) {
    throw error
  }
}

export {
  getCatchRawRecord,
  getTrapVisitCatchRawRecords,
  postCatchRaw,
  putCatchRaw,
}
