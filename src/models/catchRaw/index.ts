import db from '../../db'
import {
  CatchRaw,
  ExistingMarksI,
  GeneticSamplingDataI,
  MarkAppliedI,
} from '../../interfaces'
import { postExistingMarks } from './existingMarks'
import { postGeneticSamplingData } from './geneticSamplingData'
import { postGeneticSamplingCrew } from './geneticSamplingCrew'
import { postMarkApplied } from './markApplied'
import { postMarkAppliedCrew } from './markAppliedCrew'

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
  try {
    const catchRawRecords = await knex<CatchRaw>('catchRaw')
      .select('*')
      .where('trapVisitId', trapVisitId)

    return catchRawRecords
  } catch (error) {
    throw error
  }
}

async function getProgramCatchRawRecords(
  programId: number | string,
  limit?: number
) {
  try {
    // get current date, set year to previous year
    const pastYear = new Date()
    pastYear.setFullYear(pastYear.getFullYear() - 1)

    let query = knex<CatchRaw>('catchRaw')
      .select('*')
      .where('programId', programId)
      .andWhere('created_at', '>=', pastYear)
      .orderBy('catchRaw.id')

    if (limit) {
      query = query.limit(limit)
    }

    const catchRaws = await query

    // Rest of the code...

    const catchRawIds = catchRaws.map((catchRaw) => catchRaw.id)

    const [markAppliedData, existingMarksData, geneticSampleData] =
      await Promise.all([
        knex<MarkAppliedI>('markApplied')
          .select('*')
          .whereIn('catchRawId', catchRawIds),
        knex<ExistingMarksI>('existingMarks')
          .select('*')
          .whereIn('catchRawId', catchRawIds),
        knex<GeneticSamplingDataI>('geneticSamplingData')
          .select('*')
          .whereIn('catchRawId', catchRawIds),
      ])

    const releaseIds = catchRaws
      .filter((catchRaw) => catchRaw.releaseId)
      .map((catchRaw) => catchRaw.releaseId)

    const releaseData = await knex('release')
      .select('*')
      .whereIn('id', releaseIds)

    const payload = catchRaws.map((catchRaw) => {
      const markApplied = markAppliedData.filter(
        (row) => row.catchRawId === catchRaw.id
      )
      const existingMarks = existingMarksData.filter(
        (row) => row.catchRawId === catchRaw.id
      )
      const geneticSample = geneticSampleData.filter(
        (row) => row.catchRawId === catchRaw.id
      )
      const release = releaseData.find((row) => row.id === catchRaw.releaseId)

      return {
        createdCatchRawResponse: catchRaw,
        createdMarkAppliedResponse: markApplied.length ? markApplied : null,
        createdExistingMarksResponse: existingMarks.length
          ? existingMarks
          : null,
        createdGeneticSamplingDataResponse: geneticSample.length
          ? geneticSample
          : null,
        releaseResponse: release || null,
      }
    })

    return payload
  } catch (error) {
    throw error
  }
}

const createCatchRaw = async (catchRawValues: Record<string, any>) => {
  try {
    const existingMarks = catchRawValues?.existingMarks
    delete catchRawValues?.existingMarks
    const geneticSamplingData = catchRawValues?.geneticSamplingData
    delete catchRawValues?.geneticSamplingData
    const appliedMarks = catchRawValues?.appliedMarks
    delete catchRawValues?.appliedMarks

    const createdCatchRawResponse = await knex<CatchRaw>('catchRaw').insert(
      catchRawValues,
      ['*']
    )
    const createdCatchRaw = createdCatchRawResponse?.[0]

    let createdExistingMarksResponse = []
    let createdMarkAppliedResponse = []
    let createdGeneticSamplingDataResponse = []

    if (existingMarks?.length > 0) {
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

    if (geneticSamplingData?.length > 0) {
      await Promise.all(
        geneticSamplingData.map(async (geneticSamplingSubmission: any) => {
          const crewMember = geneticSamplingSubmission.crewMember
          const geneticSamplingSubmissionCopy = { ...geneticSamplingSubmission }
          delete geneticSamplingSubmissionCopy.crewMember
          delete geneticSamplingSubmissionCopy.UID
          const geneticSamplingDataPayload = {
            catchRawId: createdCatchRaw.id,
            ...geneticSamplingSubmissionCopy,
          }
          const createdSingleGeneticSamplingDataResponse =
            await postGeneticSamplingData(geneticSamplingDataPayload)

          const geneticSamplingDataCrewPayload: any = {
            personnelId: crewMember,
            geneticSamplingDataId:
              createdSingleGeneticSamplingDataResponse[0].id,
          }
          await postGeneticSamplingCrew(geneticSamplingDataCrewPayload)

          createdGeneticSamplingDataResponse.push({
            ...createdSingleGeneticSamplingDataResponse[0],
            crewMember: crewMember,
          })
        })
      )
    }

    if (appliedMarks?.length > 0) {
      await Promise.all(
        appliedMarks.map(async (appliedMarkSubmission: any) => {
          const crewMember = appliedMarkSubmission.crewMember
          const appliedMarkSubmissionCopy = { ...appliedMarkSubmission }
          delete appliedMarkSubmissionCopy.crewMember
          delete appliedMarkSubmissionCopy.UID
          const markAppliedPayload = {
            catchRawId: createdCatchRaw.id,
            programId: createdCatchRaw.programId,
            createdAt: new Date(createdCatchRaw.createdAt),
            updatedAt: new Date(createdCatchRaw.updatedAt),
            ...appliedMarkSubmissionCopy,
          }
          const createdSingleMarkAppliedResponse = await postMarkApplied(
            markAppliedPayload
          )

          const markAppliedCrewPayload: any = {
            personnel: crewMember,
            markAppliedId: createdSingleMarkAppliedResponse[0].id,
          }
          await postMarkAppliedCrew(markAppliedCrewPayload)

          createdMarkAppliedResponse.push({
            ...createdSingleMarkAppliedResponse[0],
            crewMember: crewMember,
          })
        })
      )
    }

    return {
      createdCatchRawResponse: createdCatchRaw,
      createdMarkAppliedResponse,
      createdExistingMarksResponse,
      createdGeneticSamplingDataResponse,
    }
  } catch (error) {
    console.log('error', error)
    console.log('err', catchRawValues)
    return {
      catchRawValues,
      error,
    }
  }
}

// post trapVisit - admin only route
// single object or array of objects
async function postCatchRaw(catchRawValues): Promise<
  | {
      createdCatchRawResponse: Array<CatchRaw>
      createdExistingMarksResponse: Array<ExistingMarksI>
      createdMarkAppliedResponse: Array<MarkAppliedI>
      createdGeneticSamplingDataResponse: Array<GeneticSamplingDataI>
    }
  | any
> {
  try {
    if (Array.isArray(catchRawValues)) {
      const results = await Promise.all(
        catchRawValues?.map(async (catchRawValue) => {
          const result = createCatchRaw(catchRawValue)
          return result
        })
      )
      return results
    } else if (typeof catchRawValues === 'object') {
      const result = createCatchRaw(catchRawValues)
      return result
    }
  } catch (error) {
    throw error
  }
}

// PUT trapVisit - admin only route
async function putCatchRaw(
  catchRawId: string,
  catchRawObject: Record<string, any>
): Promise<CatchRaw> {
  try {
    delete catchRawObject.createdCatchRawResponse.id
    const updatedCatchRawRecord = await knex<CatchRaw>('catchRaw')
      .where('id', catchRawId)
      .update(catchRawObject.createdCatchRawResponse, ['*'])

    let updatedMarkApplied = []

    if (catchRawObject.createdMarkAppliedResponse) {
      updatedMarkApplied = await Promise.all(
        catchRawObject.createdMarkAppliedResponse.map(async (markApplied) => {
          let id = markApplied.id
          delete markApplied.id
          const updatedMarkAppliedRecord = await knex<MarkAppliedI>(
            'markApplied'
          )
            .where('id', id)
            .update(markApplied, ['*'])
          return updatedMarkAppliedRecord[0]
        })
      )
    }

    let updatedExistingMarks = []

    if (catchRawObject.createdExistingMarksResponse) {
      updatedExistingMarks = await Promise.all(
        catchRawObject.createdExistingMarksResponse.map(
          async (existingMark) => {
            let id = existingMark.id
            delete existingMark.id
            await knex<ExistingMarksI>('existingMarks')
              .where('id', id)
              .update(existingMark, ['*'])
          }
        )
      )
    }

    let updatedGeneticSamplingData = []

    if (catchRawObject.createdGeneticSamplingDataResponse) {
      updatedGeneticSamplingData = await Promise.all(
        catchRawObject.createdGeneticSamplingDataResponse.map(
          async (geneticSample) => {
            let id = geneticSample.id
            delete geneticSample.id
            await knex<GeneticSamplingDataI>('geneticSamplingData')
              .where('id', id)
              .update(geneticSample, ['*'])
          }
        )
      )
    }

    let updatedRelease = null

    if (catchRawObject.releaseResponse) {
      let id = catchRawObject.releaseResponse.id
      delete catchRawObject.releaseResponse.id
      updatedRelease = await knex('release')
        .where('id', id)
        .update(catchRawObject.releaseResponse, ['*'])
    }

    return {
      createdCatchRawResponse: updatedCatchRawRecord[0],
      createdMarkAppliedResponse: updatedMarkApplied.length
        ? updatedMarkApplied
        : null,
      createdExistingMarksResponse: updatedExistingMarks.length
        ? updatedExistingMarks
        : null,
      createdGeneticSamplingDataResponse: updatedGeneticSamplingData.length
        ? updatedGeneticSamplingData
        : null,
      releaseResponse: updatedRelease || null,
    }
  } catch (error) {
    throw error
  }
}

export {
  getCatchRawRecord,
  getTrapVisitCatchRawRecords,
  getProgramCatchRawRecords,
  postCatchRaw,
  putCatchRaw,
}
