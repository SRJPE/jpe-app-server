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

async function getProgramCatchRawRecords(programId: number | string) {
  try {
    // get current date, set year to previous year
    const pastYear = new Date()
    pastYear.setFullYear(pastYear.getFullYear() - 1)

    const catchRaws = await knex<CatchRaw>('catchRaw')
      .select('*')
      .where('programId', programId)
      .andWhere('created_at', '>=', pastYear)
      .orderBy('catchRaw.id')

    const catchRawIds = catchRaws.map(catchRaw => catchRaw.id)

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
      .filter(catchRaw => catchRaw.releaseId)
      .map(catchRaw => catchRaw.releaseId)

    const releaseData = await knex('release')
      .select('*')
      .whereIn('id', releaseIds)

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
      const release = releaseData.find(row => row.id === catchRaw.releaseId)

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
