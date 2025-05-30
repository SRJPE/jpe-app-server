import { Router } from 'express'
import trapFunctionalityRouter from './trapFunctionality'
import fishProcessedRouter from './fishProcessed'
import lifeStageRouter from './lifeStage'
import markTypeRouter from './markType'
import markColorRouter from './markColor'
import runRouter from './run'
import unitRouter from './unit'
import releasePurposeRouter from './releasePurpose'
import visitTypeRouter from './visitType'
import trapCoordinatesRouter from './trapCoordinates'
import { getAllTrapVisitDropdowns } from '../../services/trapVisit'
import {
  getProgramTrapVisits,
  getTrapVisit,
  postTrapVisit,
  putTrapVisit,
} from '../../models/trapVisit'
import { getVisitSetupDefaultValues } from '../../services/trapVisit'
import { putTrapVisitWaterTurbidity } from '../../models/trapVisit/trapVisitEnvironmental'
import { isAuthorized } from '../../middleware/auth-middleware'

const trapVisitRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/trap-visit', trapVisitRouter)

  trapVisitRouter.post('/', isAuthorized(), async (req, res) => {
    try {
      const trapVisitValues = req.body
      const createdTrapVisit = await postTrapVisit(trapVisitValues)
      res.status(200).send(createdTrapVisit)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

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

  trapVisitRouter.get('/:trapVisitId', async (req, res) => {
    try {
      const { trapVisitId } = req.params
      const trapVisit = await getTrapVisit(trapVisitId)
      res.status(200).send(trapVisit)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  trapVisitRouter.get(
    '/program/:programId',
    isAuthorized(), // Middleware function
    async (req, res) => {
      try {
        const { programId } = req.params
        const trapVisits = await getProgramTrapVisits(programId)
        res.status(200).send(trapVisits)
      } catch (error) {
        console.error(error)
        res.status(400).send(error)
      }
    }
  )

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

  trapVisitRouter.get(
    '/visit-setup/default/:personnelId',
    isAuthorized(), // Middleware function
    async (req, res) => {
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
    }
  )

  trapVisitRouter.put('/:trapVisitId/environmental', async (req, res) => {
    try {
      const { trapVisitId } = req.params
      const { waterTurbidity } = req.body

      const trapVisitEnvironmentalResponse = await putTrapVisitWaterTurbidity({
        trapVisitId,
        waterTurbidity,
      })

      if (trapVisitEnvironmentalResponse) {
        res.status(200).send({
          status: 200,
          trapVisitId,
          waterTurbidity,
        })
      } else {
        res.status(400).send({
          status: 400,
          trapVisitId,
          waterTurbidity,
        })
      }
    } catch (error) {
      console.error(error)
      res.status(400).send({ status: 400, error })
    }
  })

  trapFunctionalityRouter(trapVisitRouter)
  fishProcessedRouter(trapVisitRouter)
  lifeStageRouter(trapVisitRouter)
  markTypeRouter(trapVisitRouter)
  markColorRouter(trapVisitRouter)
  runRouter(trapVisitRouter)
  releasePurposeRouter(trapVisitRouter)
  visitTypeRouter(trapVisitRouter)
  unitRouter(trapVisitRouter)
  trapCoordinatesRouter(trapVisitRouter)
}
