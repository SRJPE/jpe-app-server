import db from '../../db'

const { knex } = db

async function postVisitSetupValues(
  trapVisitId,
  visitSetupValues
): Promise<any> {
  // set stream
  // set site and subsite
  // set crew
}

export { postVisitSetupValues }
