import db from '../../db'
import { getProgramCatchRawRecords } from '../catchRaw'
import { getPersonnel } from '../personnel'
import { getPersonnelPrograms } from '../program'
import { getRelease } from '../release'
import { getProgramTrapVisits } from '../trapVisit'

const { knex } = db

async function getReportMetaData(programId: string): Promise<any> {
  try {
    //get associated program and personnel lead info
    const program = await knex<any>('program')
      .select('*')
      .where('id', programId)

    const personnelLead = await knex<any>('program')
      .join('personnel', 'personnel.id', 'program.personnelLead')
      .where('program.id', programId)
      .select('personnel.*')
    const fundingAgency = await knex<any>('program')
      .join('agency', 'agency.id', 'program.fundingAgency')
      .where('program.id', programId)
      .select('agency.*')
    return {
      program,
      personnelLead,
      fundingAgency,
    }
  } catch (error) {
    throw error
  }
}

// get Bi-weekly Passage Summary Report Data
async function getBiWeeklyPassageSummary(
  programId: string
  // personnelId: string
): Promise<any> {
  try {
    // get associated program, personnel lead and funding agency info
    const { program, personnelLead, fundingAgency } = await getReportMetaData(
      programId
    )

    //programRunDesignationMethod depends on catchRaw

    //get Data for Historical Mean Cumulative Passage
    // const cumulativePassage = getHistoricalMeanCumulativePassage()

    // get Data for Passage Estimates (need to change these to use program ID and get BiWeekly Data)

    // const catchBiWeekly = await getProgramCatchRawRecords(programId)
    // const environmentalBiWeekly = await getProgramTrapVisits(programId)
    // const releaseBiWeekly = await getRelease(programId) //needs to be changed to get release data for bi-weekly

    return {
      program,
      personnelLead,
      fundingAgency,
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

export { getBiWeeklyPassageSummary, getReportMetaData }
