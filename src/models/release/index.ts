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

const postRelease = async (release: Record<string, any>) => {
  try {
    if (Array.isArray(release)) {
      const results = await Promise.all(
        release.map(async releaseValue => {
          const result = createRelease(releaseValue)
          return result
        })
      )
      return results
    } else if (typeof release === 'object') {
      const result = createRelease(release)
      return result
    }
  } catch (error) {
    throw error
  }
}

// post release - admin only route
async function createRelease(releaseValues): Promise<{
  createdReleaseResponse: Array<Release>
  createdReleaseCrewResponse: Array<ReleaseCrew>
  createdReleaseMarksResponse: Array<ReleaseMarks>
}> {
  try {
    const releaseMarks = releaseValues.marksArray || []
    delete releaseValues.marksArray
    const releaseCrew = releaseValues.releaseCrew || []
    delete releaseValues.releaseCrew

    releaseValues.releasedAt = releaseValues.releasedAt || null
    releaseValues.markedAt = releaseValues.markedAt || null

    const createdReleaseResponse = await knex<Release>('release').insert(
      releaseValues,
      ['*']
    )

    const createdRelease = createdReleaseResponse?.[0]
    let createdReleaseCrewResponse = []
    let createdReleaseMarksResponse = []

    // insert releaseCrew
    if (releaseCrew.length) {
      const releaseCrewPayload = releaseCrew?.map((personnelId: number) => {
        return {
          releaseId: createdRelease.id,
          personnelId,
        }
      })
      createdReleaseCrewResponse = await postReleaseCrew(releaseCrewPayload)
    }

    if (releaseMarks.length) {
      // insert releaseMarks
      const releaseMarksPayload = releaseMarks?.map(markObject => {
        return {
          releaseId: createdRelease.id,
          ...markObject,
        }
      })
      createdReleaseMarksResponse = await postReleaseMarks(releaseMarksPayload)
    }

    return {
      createdReleaseResponse,
      createdReleaseCrewResponse,
      createdReleaseMarksResponse,
    }
  } catch (error) {
    console.log('error', error)
    throw error
  }
}

export { getRelease, postRelease }
