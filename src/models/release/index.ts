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

async function getProgramReleases(programId: number | string): Promise<any> {
  try {
    const releases = await knex<Release>('release')
      .select(
        'release.*',
        'releaseSite.releaseSiteName',
        'markType.definition as markTypeName',
        'markColor.definition as markColorName',
        'bodyPart.definition as markPositionName',
        'releaseMarks.fishCount',
        'releaseMarks.releaseSiteId as markReleaseSiteId',
        'markReleaseSite.releaseSiteName as markReleaseSiteName'
      )
      .where('programId', programId)
      .join('releaseSite', 'release.releaseSiteId', 'releaseSite.id')
      .leftJoin('releaseMarks', 'release.id', 'releaseMarks.releaseId')
      .leftJoin('markType', 'markType.id', 'releaseMarks.markType')
      .leftJoin('markColor', 'markColor.id', 'releaseMarks.markColor')
      .leftJoin('bodyPart', 'bodyPart.id', 'releaseMarks.markPosition')
      .leftJoin(
        'releaseSite as markReleaseSite',
        'markReleaseSite.id',
        'releaseMarks.releaseSiteId'
      )
    return releases
  } catch (error) {
    throw error
  }
}

async function putRelease(
  releaseId: string,
  releaseObject: Record<string, any>
): Promise<any> {
  try {
    const releaseData = { ...releaseObject.createdReleaseResponse }
    delete releaseData.id
    const updated = await knex<Release>('release')
      .where('id', releaseId)
      .update(releaseData, ['*'])
    return { createdReleaseResponse: updated[0] }
  } catch (error) {
    throw error
  }
}

// DELETE release - cascades releaseCrew and releaseMarks (both NO ACTION
// FKs, no CASCADE at the DB level). A recapture (existingMarks) may record
// which release the fish's original mark came from — unlink rather than
// delete so the recapture record survives.
async function deleteRelease(releaseId: number | string): Promise<number> {
  try {
    return await knex.transaction(async trx => {
      await trx<ReleaseCrew>('releaseCrew').where('releaseId', releaseId).del()
      await trx<ReleaseMarks>('releaseMarks')
        .where('releaseId', releaseId)
        .del()
      await trx('existingMarks')
        .where('releaseId', releaseId)
        .update({ releaseId: null })

      const deleted = await trx<Release>('release').where('id', releaseId).del()

      if (!deleted) {
        throw new Error(`Release ${releaseId} not found`)
      }

      return deleted
    })
  } catch (error) {
    throw error
  }
}

export {
  getRelease,
  postRelease,
  getProgramReleases,
  putRelease,
  deleteRelease,
}
