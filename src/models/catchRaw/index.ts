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
  const catchRawRecords = await knex<CatchRaw>('catchRaw')
    .select('*')
    .where('trapVisitId', trapVisitId)

  return catchRawRecords
}

async function getProgramCatchRawRecords(programId: number | string) {
  const payload = []

  const catchRaws = await knex<CatchRaw>('catchRaw')
    .select('*')
    .where('programId', programId)

  await Promise.all(
    catchRaws.map(async (catchRaw) => {
      const markApplied = await knex<MarkAppliedI>('markApplied')
        .select('*')
        .where('catchRawId', catchRaw.id)

      const existingMarks = await knex<ExistingMarksI>('existingMarks')
        .select('*')
        .where('catchRawId', catchRaw.id)

      const geneticSample = await knex<GeneticSamplingDataI>(
        'geneticSamplingData'
      )
        .select('*')
        .where('catchRawId', catchRaw.id)

      let release: any = {}
      if (catchRaw.releaseId) {
        release = await knex('release').select('*').where('id', catchRaw.releaseId)[0]
      }

      payload.push({
        createdCatchRawResponse: catchRaw,
        createdMarkAppliedResponse: markApplied ?? null,
        createdExistingMarksResponse: existingMarks ?? null,
        createdGeneticSamplingDataResponse: geneticSample ?? null,
        releaseResponse: release
      })
    })
  )

  return payload
}

// post trapVisit - admin only route
// single object or array of objects
async function postCatchRaw(catchRawValues): Promise<{
  createdCatchRawResponse: Array<CatchRaw>
  createdExistingMarksResponse: Array<ExistingMarksI>
  createdMarkAppliedResponse: Array<MarkAppliedI>
  createdGeneticSamplingDataResponse: Array<GeneticSamplingDataI>
}> {
  try {
    const existingMarks = catchRawValues.existingMarks
    delete catchRawValues.existingMarks
    const geneticSamplingData = catchRawValues.geneticSamplingData
    delete catchRawValues.geneticSamplingData
    const appliedMarks = catchRawValues.appliedMarks
    delete catchRawValues.appliedMarks

    const createdCatchRawResponse = await knex<CatchRaw>('catchRaw').insert(
      catchRawValues,
      ['*']
    )
    const createdCatchRaw = createdCatchRawResponse?.[0]

    let createdExistingMarksResponse = []
    let createdMarkAppliedResponse = []
    let createdGeneticSamplingDataResponse = []

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

    if (geneticSamplingData.length > 0) {
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

    if (appliedMarks.length > 0) {
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
  getProgramCatchRawRecords,
  postCatchRaw,
  putCatchRaw,
}
