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
import {
  getAllTrapVisitDropdowns,
  getVisitSetupDefaultValues,
} from '../../services/trapVisit'
import {
  getTrapVisit,
  postTrapVisit,
  putTrapVisit,
} from '../../models/trapVisit'

const trapVisitRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/trap-visit', trapVisitRouter)

  // GET /trap-visit/dropdowns
  trapVisitRouter.get('/dropdowns', async (req, res) => {
    try {
      const trapVisitDropdowns = await getAllTrapVisitDropdowns()
      res.status(200).send(trapVisitDropdowns)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  trapVisitRouter.post('/', async (req, res) => {
    try {
      const trapVisitValues = req.body
      const createdTrapVisit = await postTrapVisit(trapVisitValues)
      res.status(200).send(createdTrapVisit)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  trapVisitRouter.put('/:trapVisitId', async (req, res) => {
    try {
      const { trapVisitId } = req.params
      const trapVisitValues = req.body
      const editedTrapVisit = await putTrapVisit(trapVisitId, trapVisitValues)
      res.status(200).send(editedTrapVisit)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  trapVisitRouter.get('/visit-setup/:personnelId', async (req, res) => {
    try {
      const { personnelId } = req.params
      const trapSetupDefaultValues = await getVisitSetupDefaultValues(
        personnelId
      )
      res.status(200).send(trapSetupDefaultValues)
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
