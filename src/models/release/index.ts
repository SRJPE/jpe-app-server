import db from '../../db'
import { Release, ReleaseCrew } from '../../interfaces'

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
}> {
  try {
    const allReleaseCrews = []
    allReleaseCrews.push([...releaseValues.crew])
    delete releaseValues.crew
    const createdReleaseResponse = await knex<Release>('release').insert(
      releaseValues,
      ['*']
    )

    const allReleaseCrewPromises = []
    const createdReleaseCrewResponse = []

    createdReleaseResponse.forEach((release, idx) => {
      const releaseCrewPromises = []
      allReleaseCrews[idx].forEach(async (personnelId) => {
        const releaseCrewPayload = {
          personnelId,
          releaseId: release.id,
        }
        releaseCrewPromises.push(
          knex<ReleaseCrew>('releaseCrew').insert(releaseCrewPayload, [
            '*',
          ])
        )
      })
      allReleaseCrewPromises.push(releaseCrewPromises)
    })

    return Promise.all(
      allReleaseCrewPromises.map((releaseCrewPromises) =>
        Promise.all(releaseCrewPromises).then((response) => {
          console.log('response: ', response)
          const crewIds = response.map((response) => response[0].personnelId)
          createdReleaseCrewResponse.push(crewIds)
        })
      )
    ).then(() => {
      return { createdReleaseResponse, createdReleaseCrewResponse }
    })
  } catch (error) {
    throw error
  }
}

export { getRelease, postRelease }