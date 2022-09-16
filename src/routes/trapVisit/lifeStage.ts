import { Router } from 'express'
import { getLifeStages } from '../../models/trapVisit/lifeStage'

const lifeStageRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/life-stage', lifeStageRouter)

  //GET
  lifeStageRouter.get('/', async (req, res) => {
    try {
      const result = await getLifeStages()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
