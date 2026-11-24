import { Router } from 'express'
import {
  putGeneticSamplingData,
  deleteGeneticSamplingData,
} from '../../models/catchRaw/geneticSamplingData'
import {
  isAuthorized,
  requireProgramMatch,
} from '../../middleware/auth-middleware'
import db from '../../db'

const { knex } = db

const geneticSamplingRouter = Router({ mergeParams: true })

// genetic_sampling_data has no programId column of its own — resolve it
// through the catchRaw record it belongs to.
const resolveProgramIdViaCatchRaw = async (
  geneticSamplingId: string,
): Promise<number | null> => {
  const row = await knex('geneticSamplingData')
    .join('catchRaw', 'catchRaw.id', 'geneticSamplingData.catchRawId')
    .where('geneticSamplingData.id', geneticSamplingId)
    .select('catchRaw.programId')
    .first()
  return row ? row.programId : null
}

export default (mainRouter: Router) => {
  mainRouter.use('/genetic-sampling', geneticSamplingRouter)

  geneticSamplingRouter.put(
    '/:geneticSamplingId',
    isAuthorized(),
    requireProgramMatch('geneticSamplingData', 'geneticSamplingId', {
      resolveProgramId: resolveProgramIdViaCatchRaw,
    }),
    async (req, res) => {
      try {
        const { geneticSamplingId } = req.params
        const updated = await putGeneticSamplingData(
          geneticSamplingId,
          req.body,
        )
        res.status(200).send(updated)
      } catch (error) {
        console.error(error)
        res.status(400).send(error)
      }
    },
  )

  geneticSamplingRouter.delete(
    '/:geneticSamplingId',
    isAuthorized(),
    requireProgramMatch('geneticSamplingData', 'geneticSamplingId', {
      resolveProgramId: resolveProgramIdViaCatchRaw,
    }),
    async (req, res) => {
      try {
        const { geneticSamplingId } = req.params
        const deleted = await deleteGeneticSamplingData(geneticSamplingId)
        res.status(200).json({ deleted })
      } catch (error) {
        console.error(error)
        res.status(400).send(error)
      }
    },
  )
}
