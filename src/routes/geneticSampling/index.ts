import { Router } from 'express'
import {
  putGeneticSamplingData,
  deleteGeneticSamplingData,
} from '../../models/catchRaw/geneticSamplingData'

const geneticSamplingRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/genetic-sampling', geneticSamplingRouter)

  geneticSamplingRouter.put('/:geneticSamplingId', async (req, res) => {
    try {
      const { geneticSamplingId } = req.params
      const updated = await putGeneticSamplingData(geneticSamplingId, req.body)
      res.status(200).send(updated)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  geneticSamplingRouter.delete('/:geneticSamplingId', async (req, res) => {
    try {
      const { geneticSamplingId } = req.params
      const deleted = await deleteGeneticSamplingData(geneticSamplingId)
      res.status(200).json({ deleted })
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
