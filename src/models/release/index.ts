import db from '../../db'
import { Release, ReleaseCrew, ReleaseMarks } from '../../interfaces'
import { postReleaseMarks } from './releaseMarks'
import { postReleaseCrew } from './releaseCrew'

const { knex } = db

// get release
async function getRelease(releaseId: number | string): Promise<Release> {
  try {
    const release = await knex<Release>('release')
      .select('*')
      .where('id', releaseId)

    const crew = await knex<Release>('releaseCrew')
      .select('*')
      .where('releaseId', releaseId)
      .join('personnel', 'personnel.id', 'releaseCrew.personnelId')

    return { ...release[0], crew }
  } catch (error) {
    throw error
  }
}

// post release - admin only route
async function postRelease(releaseValues): Promise<{
  createdReleaseResponse: Array<Release>
  createdReleaseCrewResponse: Array<ReleaseCrew>
  createdReleaseMarksResponse: Array<ReleaseMarks>
}> {
  try {
    const releaseMarks = releaseValues.marksArray
    delete releaseValues.marksArray
    const releaseCrew = releaseValues.releaseCrew
    delete releaseValues.releaseCrew

    releaseValues.releasedAt = new Date(releaseValues.releasedAt)
    releaseValues.markedAt = new Date(releaseValues.markedAt)

    const createdReleaseResponse = await knex<Release>('release').insert(
      releaseValues,
      ['*']
    )

    const createdRelease = createdReleaseResponse?.[0]

    // insert releaseCrew
    const releaseCrewPayload = releaseCrew.map((personnelId: number) => {
      return {
        releaseId: createdRelease.id,
        personnelId,
      }
    })

    const createdReleaseCrewResponse = await postReleaseCrew(releaseCrewPayload)

    // insert releaseMarks
    const releaseMarksPayload = releaseMarks.map((markObject) => {
      return {
        releaseId: createdRelease.id,
        ...markObject,
      }
    })
    const createdReleaseMarksResponse = await postReleaseMarks(
      releaseMarksPayload
    )

    return {
      createdReleaseResponse,
      createdReleaseCrewResponse,
      createdReleaseMarksResponse,
    }
  } catch (error) {
    throw error
  }
}

export { getRelease, postRelease }
