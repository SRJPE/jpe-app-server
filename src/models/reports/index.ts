import db from '../../db'
import { getProgramCatchRawRecords } from '../catchRaw'
import { getPersonnel } from '../personnel'
import { getPersonnelPrograms } from '../program'
import { getRelease } from '../release'

const { knex } = db

// get Bi-weekly Passage Summary Report Data
async function getBiWeeklyPassageSummary(personnelId: string): Promise<any> {
  try {
    // get associated programs and personnel lead info
    const [programs, personnelLeadInfo] = await Promise.all([
      getPersonnelPrograms(personnelId),
      getPersonnel(personnelId),
    ])
    //get Data for Historical Mean Cumulative Passage
    // const cumulativePassage = getHistoricalMeanCumulativePassage()

    // get Data for Passage Estimates (need to change these to use program ID and get BiWeekly Data)

    // const passageEstimates = getPassageEstimates(personnelId)
    // const catchBiWeekly = await getProgramCatchRawRecords(personnelId)
    // const environmentalBiWeekly = await getPersonnelPrograms(personnelId)
    // const releaseBiWeekly = await getRelease(personnelId) //needs to be changed to get release data for bi-weekly

    return {
      programs,
      personnelLeadInfo,
      // cumulativePassage,
      // catchBiWeekly,
      // environmentalBiWeekly,
      // releaseBiWeekly,
      // passageEstimates,
    }
  } catch (error) {
    throw error
  }
}

export { getBiWeeklyPassageSummary }
