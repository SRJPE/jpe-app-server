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
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 54) //change back to 14 after testing
    const trapVisits = await knex<TrapVisit>('trapVisit')
      .select('*')
      .where('programId', programId)
      .andWhere('trap_visit_time_end', '>=', twoWeeksAgo)

    const trapVisitIds = trapVisits.map(trapVisit => trapVisit.id)
    const [environmentalBiWeekly, catchBiWeekly] = await Promise.all([
      knex<any>('trapVisitEnvironmental')
        .select('*')
        .whereIn('trapVisitId', trapVisitIds),

      knex<CatchRaw>('catchRaw')
        .select('*')
        .whereIn('trapVisitId', trapVisitIds),
    ])
    const releaseIds = catchBiWeekly
      .filter(catchRaw => catchRaw.releaseId)
      .map(catchRaw => catchRaw.releaseId)

    const releaseBiWeekly = await knex('release')
      .select('*')
      .whereIn('id', releaseIds)

    const fishCountsCTE = knex('catch_raw')
      .select(
        'trap_visit_id',
        knex.raw(`
          SUM(CASE WHEN (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 1 THEN num_fish_caught ELSE 0 END) AS total_fish_spring,
          SUM(CASE WHEN (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 2 THEN num_fish_caught ELSE 0 END) AS total_fish_fall,
          SUM(CASE WHEN (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 3 THEN num_fish_caught ELSE 0 END) AS total_fish_winter,
          SUM(CASE WHEN (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 4 THEN num_fish_caught ELSE 0 END) AS total_fish_late_fall,
          SUM(CASE WHEN (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 5 THEN num_fish_caught ELSE 0 END) AS total_fish_hybrid,
          MIN(fork_length) FILTER (WHERE (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 1) AS min_fish_spring_fl,
          MAX(fork_length) FILTER (WHERE (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 1) AS max_fish_spring_fl,
          MIN(fork_length) FILTER (WHERE (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 2) AS min_fish_fall_fl,
          MAX(fork_length) FILTER (WHERE (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 2) AS max_fish_fall_fl,
          MIN(fork_length) FILTER (WHERE (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 3) AS min_fish_winter_fl,
          MAX(fork_length) FILTER (WHERE (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 3) AS max_fish_winter_fl,
          MIN(fork_length) FILTER (WHERE (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 4) AS min_fish_late_fall_fl,
          MAX(fork_length) FILTER (WHERE (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 4) AS max_fish_late_fall_fl,
          MIN(fork_length) FILTER (WHERE (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 5) AS min_fish_hybrid_fl,
          MAX(fork_length) FILTER (WHERE (taxon_code = '161980' OR taxon_code = '161989') AND capture_run_class = 5) AS max_fish_hybrid_fl
        `)
      )
      .groupBy('trap_visit_id')

    const query = knex
      .with('fish_counts', fishCountsCTE)
      .select(
        'tv.id',
        'tv.program_id',
        'tv.trap_visit_time_end',
        knex.raw(`
          COALESCE(fc.total_fish_spring, 0) AS total_fish_spring,
          COALESCE(fc.min_fish_spring_fl, 0) AS min_fish_spring_fl,
          COALESCE(fc.max_fish_spring_fl, 0) AS max_fish_spring_fl,
          COALESCE(fc.total_fish_fall, 0) AS total_fish_fall,
          COALESCE(fc.min_fish_fall_fl, 0) AS min_fish_fall_fl,
          COALESCE(fc.max_fish_fall_fl, 0) AS max_fish_fall_fl,
          COALESCE(fc.total_fish_winter, 0) AS total_fish_winter,
          COALESCE(fc.min_fish_winter_fl, 0) AS min_fish_winter_fl,
          COALESCE(fc.max_fish_winter_fl, 0) AS max_fish_winter_fl,
          COALESCE(fc.total_fish_late_fall, 0) AS total_fish_late_fall,
          COALESCE(fc.min_fish_late_fall_fl, 0) AS min_fish_late_fall_fl,
          COALESCE(fc.max_fish_late_fall_fl, 0) AS max_fish_late_fall_fl,
          COALESCE(fc.total_fish_hybrid, 0) AS total_fish_hybrid,
          COALESCE(fc.min_fish_hybrid_fl, 0) AS min_fish_hybrid_fl,
          COALESCE(fc.max_fish_hybrid_fl, 0) AS max_fish_hybrid_fl,
          MAX(CASE WHEN tve.measure_name = 'flow measure' THEN tve.measure_value_numeric END) AS discharge,
          MAX(CASE WHEN tve.measure_name = 'water temperature' THEN tve.measure_value_numeric END) AS water_temp,
          MAX(CASE WHEN tve.measure_name = 'water turbidity' THEN tve.measure_value_numeric END) AS water_turbidity
        `)
      )
      .from('trap_visit as tv')
      .leftJoin('fish_counts as fc', 'fc.trap_visit_id', 'tv.id')
      .leftJoin('trap_visit_environmental as tve', 'tve.trap_visit_id', 'tv.id')
      .where('tv.program_id', programId)
      .andWhere('tv.trap_visit_time_end', '>=', twoWeeksAgo)
      .groupBy(
        'tv.id',
        'fc.total_fish_spring',
        'fc.total_fish_fall',
        'fc.total_fish_winter',
        'fc.total_fish_late_fall',
        'fc.total_fish_hybrid',
        'fc.min_fish_spring_fl',
        'fc.max_fish_spring_fl',
        'fc.min_fish_fall_fl',
        'fc.max_fish_fall_fl',
        'fc.min_fish_winter_fl',
        'fc.max_fish_winter_fl',
        'fc.min_fish_late_fall_fl',
        'fc.max_fish_late_fall_fl',
        'fc.min_fish_hybrid_fl',
        'fc.max_fish_hybrid_fl'
      )

    const trapLocations = await knex('trap_locations')
      .select('*')
      .where('program_id', programId)

    const tableData = await query

    const payload = {
      trapVisits,
      catchBiWeekly,
      environmentalBiWeekly,
      releaseIds,
      releaseBiWeekly,
      trapLocations,
      tableData,
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
      trapLocations,
      tableData,
    } = await getBiWeeklyPassageSummaryRaw(programId)

    return {
      program,
      personnelLead,
      fundingAgency,
      trapVisits,
      catchBiWeekly,
      environmentalBiWeekly,
      releaseBiWeekly,
      trapLocations,
      tableData,
    }
  } catch (error) {
    throw error
  }
}

export { getBiWeeklyPassageSummary }
