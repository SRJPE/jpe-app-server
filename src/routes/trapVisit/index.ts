import { Router } from 'express'
import trapFunctionalityRouter from './trapFunctionality'
import fishProcessedRouter from './fishProcessed'
import lifeStageRouter from './lifeStage'
import markTypeRouter from './markType'
import markColorRouter from './markColor'
import runRouter from './run'
import releasePurposeRouter from './releasePurpose'
import coneDebrisVolumeRouter from './coneDebrisVolume'
import visitTypeRouter from './visitType'
import lightConditionRouter from './lightCondition'
import { getAllTrapVisitDropdowns } from '../../services/trapVisit'

const trapVisitRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/trap-visit', trapVisitRouter)

  // GET /charter/
  trapVisitRouter.get('/dropdowns', async (req, res) => {
    try {
      const trapVisitDropdowns = await getAllTrapVisitDropdowns()
      res.status(200).send(trapVisitDropdowns)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  trapFunctionalityRouter(trapVisitRouter)
  fishProcessedRouter(trapVisitRouter)
  lifeStageRouter(trapVisitRouter)
  markTypeRouter(trapVisitRouter)
  markColorRouter(trapVisitRouter)
  runRouter(trapVisitRouter)
  releasePurposeRouter(trapVisitRouter)
  coneDebrisVolumeRouter(trapVisitRouter)
  visitTypeRouter(trapVisitRouter)
  lightConditionRouter(trapVisitRouter)
}
