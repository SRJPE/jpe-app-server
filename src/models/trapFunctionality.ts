import db from '../db'
const { knex } = db

// get trap functionalities
async function getTrapFunctionalities(): Promise<Array<any>> {
  try {
    const trapFunctionalities = await knex<any>('trap_funcionality').select('*')
    return trapFunctionalities
  } catch (error) {
    throw error
  }
}

export { getTrapFunctionalities }
