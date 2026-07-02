import db from '../../db'
import { MarkAppliedI } from '../../interfaces'

const { knex } = db

async function postMarkApplied(
  MarkApplied: MarkAppliedI
): Promise<Array<MarkAppliedI>> {
  try {
    const createdMarkAppliedResponse = await knex<MarkAppliedI>(
      'markApplied'
    ).insert(MarkApplied, ['*'])

    return createdMarkAppliedResponse
  } catch (error) {
    throw error
  }
}

async function putMarkApplied(
  markAppliedId: string,
  markAppliedObject: Record<string, any>
): Promise<any> {
  try {
    const markData = { ...markAppliedObject.createdMarkAppliedResponse }
    delete markData.id
    const updated = await knex<MarkAppliedI>('markApplied')
      .where('id', markAppliedId)
      .update(markData, ['*'])
    return { createdMarkAppliedResponse: updated[0] }
  } catch (error) {
    throw error
  }
}

export { postMarkApplied, putMarkApplied }
