import db from '../../db'
import { CatchRaw, TrapVisit } from '../../interfaces'

const { knex } = db

async function getReportMetadata(programId: string): Promise<any> {
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

async function getBiWeeklyPassageSummaryRaw(programId: string): Promise<any> {
  try {
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const trapVisits = await knex<TrapVisit>('trapVisit')
      .select('*')
      .where('programId', programId)
      .andWhere('trap_visit_time_end', '>=', twoWeeksAgo)

    const trapVisitIds = trapVisits.map((trapVisit) => trapVisit.id)
    const [environmentalBiWeekly, catchBiWeekly] = await Promise.all([
      knex<any>('trapVisitEnvironmental')
        .select('*')
        .whereIn('trapVisitId', trapVisitIds),

      knex<CatchRaw>('catchRaw')
        .select('*')
        .whereIn('trapVisitId', trapVisitIds),
    ])
    const releaseIds = catchBiWeekly
      .filter((catchRaw) => catchRaw.releaseId)
      .map((catchRaw) => catchRaw.releaseId)

    const releaseBiWeekly = await knex('release')
      .select('*')
      .whereIn('id', releaseIds)
    const payload = {
      trapVisits,
      catchBiWeekly,
      environmentalBiWeekly,
      releaseIds,
      releaseBiWeekly,
    }

    return payload
  } catch (error) {
    throw error
  }
}

// get Bi-weekly Passage Summary Report Data
async function getBiWeeklyPassageSummary(programId: string): Promise<any> {
  try {
    // get associated program, personnel lead and funding agency info
    const { program, personnelLead, fundingAgency } = await getReportMetadata(
      programId
    )
    //get raw data needed for table calculations
    const {
      trapVisits,
      catchBiWeekly,
      environmentalBiWeekly,
      releaseBiWeekly,
    } = await getBiWeeklyPassageSummaryRaw(programId)

    return {
      program,
      personnelLead,
      fundingAgency,
      trapVisits,
      catchBiWeekly,
      environmentalBiWeekly,
      releaseBiWeekly,
    }
  } catch (error) {
    throw error
  }
}

export { getBiWeeklyPassageSummary }
