import { Router } from 'express'
import { getFishProcessedOptions } from '../../models/trapVisit/fishProcessed'

const fishProcessedRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/fish-processed', fishProcessedRouter)

  //GET
  fishProcessedRouter.get('/', async (req, res) => {
    try {
      const result = await getFishProcessedOptions()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
