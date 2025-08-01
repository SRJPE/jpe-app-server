import db from '../../db'
import {
  CatchRaw,
  ExistingMarksI,
  GeneticSamplingDataI,
  MarkAppliedI,
  CatchFishConditionI,
} from '../../interfaces'
import { postExistingMarks } from './existingMarks'
import { postGeneticSamplingData } from './geneticSamplingData'
import { postGeneticSamplingCrew } from './geneticSamplingCrew'
import { postMarkApplied } from './markApplied'
import { postMarkAppliedCrew } from './markAppliedCrew'
import { postCatchFishCondition } from './catchfishCondition'

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
      .select(
        'catchRaw.*',
        'trapVisit.trapVisitTimeEnd',
        'trapVisit.trapVisitTimeStart'
      )
      .where('catchRaw.programId', programId)
      .andWhere('catchRaw.created_at', '>=', pastYear)
      .orderBy('catchRaw.id', 'desc')
      .leftJoin('trapVisit', 'catchRaw.trapVisitId', 'trapVisit.id')

    if (limit) {
      query = query.limit(limit)
    }

    const catchRaws = await query

    // Rest of the code...

    // all catch records of a program
    const catchRawIds = catchRaws.map(catchRaw => catchRaw.id)

    // all mark applied, existing marks, genetic sample, and fish condition records of program
    const [
      markAppliedData,
      existingMarksData,
      geneticSampleData,
      catchFishCondition,
    ] = await Promise.all([
      knex<MarkAppliedI>('markApplied')
        .select(
          'markApplied.*',
          'catchRaw.createdAt as catchRawCreatedAt',
          'catchRaw.programId'
        )
        .join('catchRaw', 'markApplied.catchRawId', 'catchRaw.id')
        .whereIn('catchRawId', catchRawIds)
        .andWhere('catchRaw.created_at', '>=', pastYear),
      knex<ExistingMarksI>('existingMarks')
        .select(
          'existingMarks.*',
          'catchRaw.createdAt as catchRawCreatedAt',
          'catchRaw.programId'
        )
        .join('catchRaw', 'existingMarks.catchRawId', 'catchRaw.id')
        .whereIn('catchRawId', catchRawIds)
        .andWhere('catchRaw.created_at', '>=', pastYear),
      knex<GeneticSamplingDataI>('geneticSamplingData')
        .select(
          'geneticSamplingData.*',
          'catchRaw.createdAt as catchRawCreatedAt',
          'catchRaw.programId'
        )
        .join('catchRaw', 'geneticSamplingData.catchRawId', 'catchRaw.id')
        .whereIn('catchRawId', catchRawIds)
        .andWhere('catchRaw.created_at', '>=', pastYear),
      knex<CatchFishConditionI>('catchFishCondition')
        .select(
          'catchFishCondition.*',
          'catchRaw.createdAt as catchRawCreatedAt',
          'catchRaw.programId'
        )
        .whereIn('catchRawId', catchRawIds)
        .join('catchRaw', 'catchFishCondition.catchRawId', 'catchRaw.id')
        .andWhere('catchRaw.created_at', '>=', pastYear),
    ])

    // all release ids that are found within the existing marks of a program
    const releaseIds = existingMarksData
      .filter(existingMark => existingMark.releaseId)
      .map(existingMark => existingMark.releaseId)

    // all releases for a program
    const releaseData = await knex('release')
      .select('*')
      .whereIn('release.id', releaseIds)
      .join('existingMarks', 'release.id', 'existingMarks.releaseId')

    const payload = catchRaws.map(catchRaw => {
      const markApplied = markAppliedData.filter(
        row => row.catchRawId === catchRaw.id
      )
      const existingMarks = existingMarksData.filter(
        row => row.catchRawId === catchRaw.id
      )
      const geneticSample = geneticSampleData.filter(
        row => row.catchRawId === catchRaw.id
      )
      const fishCondition = catchFishCondition.filter(
        row => row.catchRawId === catchRaw.id
      )

      const release = releaseData.find(row => row.catchRawId === catchRaw.id)

      return {
        createdCatchRawResponse: catchRaw,
        createdMarkAppliedResponse: markApplied.length ? markApplied : null,
        createdExistingMarksResponse: existingMarks.length
          ? existingMarks
          : null,
        createdGeneticSamplingDataResponse: geneticSample.length
          ? geneticSample
          : null,
        createdCatchFishConditionResponse: fishCondition.length
          ? fishCondition
          : null,
        releaseResponse: release || null,
      }
    })

    return payload
  } catch (error) {
    console.log('e', error)
    throw error
  }
}

// post trapVisit - admin only route
// single object or array of objects
async function createCatchRaw(catchRawValues): Promise<{
  createdCatchRawResponse: Array<CatchRaw>
  createdExistingMarksResponse: Array<ExistingMarksI>
  createdMarkAppliedResponse: Array<MarkAppliedI>
  createdGeneticSamplingDataResponse: Array<GeneticSamplingDataI>
  createdCatchFishConditionResponse: Array<CatchFishConditionI>
}> {
  try {
    const existingMarks = catchRawValues?.existingMarks || []
    delete catchRawValues?.existingMarks
    const geneticSamplingData = catchRawValues?.geneticSamplingData || []
    delete catchRawValues?.geneticSamplingData
    const appliedMarks = catchRawValues?.appliedMarks || []
    delete catchRawValues?.appliedMarks
    const catchFishCondition = catchRawValues?.fishCondition || []
    delete catchRawValues?.fishCondition

    const createdCatchRawResponse = await knex<CatchRaw>('catchRaw').insert(
      catchRawValues,
      ['*']
    )
    const createdCatchRaw = createdCatchRawResponse?.[0]

    let createdExistingMarksResponse = []
    let createdMarkAppliedResponse = []
    let createdGeneticSamplingDataResponse = []
    let createdCatchFishConditionResponse = []

    if (existingMarks?.length > 0) {
      const existingMarksPayload = existingMarks.map((markObj: any) => {
        return {
          catchRawId: createdCatchRaw.id,
          programId: createdCatchRaw.programId,
          fishId: createdCatchRaw.taxonCode,
          createdAt: createdCatchRaw.createdAt,
          updatedAt: createdCatchRaw.updatedAt,
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
            createdAt: createdCatchRaw.createdAt,
            updatedAt: createdCatchRaw.updatedAt,
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
    if (catchFishCondition.length > 0) {
      let catchFishConditionPayload = [] as any
      catchFishConditionPayload = catchFishCondition.map(
        (fishCondition: string) => {
          return {
            catchRawId: createdCatchRaw.id,
            fishConditionId: fishCondition,
          }
        }
      )
      createdCatchFishConditionResponse = await postCatchFishCondition(
        catchFishConditionPayload
      )
    }

    return {
      createdCatchRawResponse: createdCatchRaw,
      createdMarkAppliedResponse,
      createdExistingMarksResponse,
      createdGeneticSamplingDataResponse,
      createdCatchFishConditionResponse,
    }
  } catch (error) {
    console.log('error', error)
    console.log('err', catchRawValues)
    throw error({
      catchRawValues,
      error,
    })
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
        catchRawValues?.map(async catchRawValue => {
          const result = await createCatchRaw(catchRawValue)
          return result
        })
      )
      return results
    } else if (typeof catchRawValues === 'object') {
      const result = await createCatchRaw(catchRawValues)
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
    delete catchRawObject.createdCatchRawResponse.trapVisitTimeEnd
    delete catchRawObject.createdCatchRawResponse.trapVisitTimeStart
    let updatedCatchRawRecord = await knex<CatchRaw>('catchRaw')
      .where('id', catchRawId)
      .update(catchRawObject.createdCatchRawResponse, ['*'])

    // Perform a join using the updated record's data
    if (updatedCatchRawRecord.length > 0) {
      updatedCatchRawRecord = await knex('catchRaw')
        .select(
          'catchRaw.*',
          'trapVisit.trapVisitTimeEnd',
          'trapVisit.trapVisitTimeStart'
        )
        .leftJoin('trapVisit', 'catchRaw.trapVisitId', 'trapVisit.id')
        .where('catchRaw.id', updatedCatchRawRecord[0].id) // Use the updated record's ID
    }

    let updatedMarkApplied = []

    if (catchRawObject.createdMarkAppliedResponse) {
      updatedMarkApplied = await Promise.all(
        catchRawObject.createdMarkAppliedResponse.map(async markApplied => {
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
        catchRawObject.createdExistingMarksResponse.map(async existingMark => {
          let id = existingMark?.id
          delete existingMark?.id
          if (id) {
            const updatedExistingMark = await knex<ExistingMarksI>(
              'existingMarks'
            )
              .where('id', id)
              .update(existingMark, ['*'])
            return updatedExistingMark[0]
          } else {
            return existingMark
          }
        })
      )
    }

    let updatedGeneticSamplingData = []

    if (catchRawObject.createdGeneticSamplingDataResponse) {
      updatedGeneticSamplingData = await Promise.all(
        catchRawObject.createdGeneticSamplingDataResponse.map(
          async geneticSample => {
            let id = geneticSample?.id
            delete geneticSample?.id
            if (id) {
              const updatedGeneticSample = await knex<GeneticSamplingDataI>(
                'geneticSamplingData'
              )
                .where('id', id)
                .update(geneticSample, ['*'])
              return updatedGeneticSample[0]
            } else return geneticSample
          }
        )
      )
    }

    // shouldn't be able to update a release from put catch raw
    // let updatedRelease = null

    // if (catchRawObject.releaseResponse && catchRawObject.releaseResponse.id) {
    //   let id = catchRawObject.releaseResponse.releaseId
    //   const updatedObj = (({
    //     programId,
    //     releasePurposeId,
    //     releaseSiteId,
    //     releasedAt,
    //     markedAt,
    //     runHatcheryFish,
    //     hatcheryFishWeight,
    //     totalWildFishReleased,
    //     totalHatcheryFishReleased,
    //     totalWildFishDead,
    //     totalHatcheryFishDead,
    //     hatcheryFishForkLength,
    //   }) => ({
    //     programId,
    //     releasePurposeId,
    //     releaseSiteId,
    //     releasedAt,
    //     markedAt,
    //     runHatcheryFish,
    //     hatcheryFishWeight,
    //     totalWildFishReleased,
    //     totalHatcheryFishReleased,
    //     totalWildFishDead,
    //     totalHatcheryFishDead,
    //     hatcheryFishForkLength,
    //   }))(catchRawObject.releaseResponse)

    //   updatedRelease = await knex('release')
    //     .where('id', id)
    //     .update(updatedObj, ['*'])
    // }

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
      releaseResponse: catchRawObject.releaseResponse || null,
    }
  } catch (error) {
    throw error
  }
}

const deleteCatchRaw = async (catchRawId: string) => {
  try {
    // Delete related records in other tables first to maintain referential integrity
    await knex<MarkAppliedI>('markApplied')
      .where('catchRawId', catchRawId)
      .del()

    await knex<ExistingMarksI>('existingMarks')
      .where('catchRawId', catchRawId)
      .del()

    await knex<GeneticSamplingDataI>('geneticSamplingData')
      .where('catchRawId', catchRawId)
      .del()

    await knex<CatchFishConditionI>('catchFishCondition')
      .where('catchRawId', catchRawId)
      .del()

    const deletedCatchRaw = await knex<CatchRaw>('catchRaw')
      .where('id', catchRawId)
      .del()
    return deletedCatchRaw
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
  deleteCatchRaw,
}
