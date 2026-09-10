import db from '../../db'
import { MarkAppliedI, MarkAppliedCrewI, ExistingMarksI } from '../../interfaces'

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

// DELETE markApplied - cascades markAppliedCrew (NO ACTION FK, no CASCADE at
// the DB level). A recapture elsewhere may reference this mark (fish marked
// here, recaptured on a different visit) — unlink rather than delete so that
// recapture record survives.
async function deleteMarkApplied(markAppliedId: string): Promise<number> {
  try {
    return await knex.transaction(async trx => {
      await trx<ExistingMarksI>('existingMarks')
        .where('markAppliedId', markAppliedId)
        .update({ markAppliedId: null })

      await trx<MarkAppliedCrewI>('markAppliedCrew')
        .where('markAppliedId', markAppliedId)
        .del()

      const deleted = await trx<MarkAppliedI>('markApplied')
        .where('id', markAppliedId)
        .del()

      if (!deleted) {
        throw new Error(`Mark applied ${markAppliedId} not found`)
      }

      return deleted
    })
  } catch (error) {
    throw error
  }
}

export { postMarkApplied, putMarkApplied, deleteMarkApplied }
