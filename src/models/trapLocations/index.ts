import db from '../../db'
import { TrapLocations } from '../../interfaces'
import { postReleaseSite } from '../releaseSite'

const { knex } = db

// get trap locations for program
async function getProgramTrapLocations(programId): Promise<TrapLocations[]> {
  try {
    const trapLocations = await knex<TrapLocations>('trapLocations')
      .where('trapLocations.programId', programId)
      .select('*')
      .orderBy('trapLocations.id')

    return trapLocations
  } catch (error) {
    throw error
  }
}

// post trap location
async function postTrapLocations(
  trapLocationsValues
): Promise<TrapLocations[]> {
  try {
    let trappingSitesPayload = []
    let releaseSitesPayload = []
    trapLocationsValues.forEach((trappingSite: any) => {
      trappingSitesPayload.push({
        programId: trappingSite.programId,
        trapName: trappingSite.trapName,
        dataRecorderId: trappingSite.dataRecorderId,
        dataRecorderAgencyId: trappingSite.dataRecorderAgencyId,
        siteName: trappingSite.siteName,
        coneSizeFt: trappingSite.coneSizeFt,
        xCoord: trappingSite.xCoord,
        yCoord: trappingSite.yCoord,
        gageAgency: trappingSite.gageAgency,
        createdAt: trappingSite.createdAt,
        updatedAt: trappingSite.updatedAt,
      })
      releaseSitesPayload.push({
        releaseSiteName: trappingSite.releaseSiteName,
        release_site_x_coord: trappingSite.releaseSiteXCoord,
        release_site_y_coord: trappingSite.releaseSiteYCoord,
      })
    })
    const createdTrapLocations = await knex<TrapLocations>(
      'trapLocations'
    ).insert(trappingSitesPayload, ['*'])

    if (releaseSitesPayload) {
      for (let i = 0; i < createdTrapLocations.length; i++) {
        releaseSitesPayload[i].trapLocationsId = createdTrapLocations[i].id
      }
      await postReleaseSite(releaseSitesPayload)
    }

    return createdTrapLocations
  } catch (error) {
    throw error
  }
}

export { getProgramTrapLocations, postTrapLocations }
