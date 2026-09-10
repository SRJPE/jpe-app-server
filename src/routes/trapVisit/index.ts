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
  deleteTrapVisit,
} from '../../models/trapVisit'
import { getVisitSetupDefaultValues } from '../../services/trapVisit'
import { putTrapVisitWaterTurbidity } from '../../models/trapVisit/trapVisitEnvironmental'
import { isAuthorized } from '../../middleware/auth-middleware'

const trapVisitRouter = Router({ mergeParams: true })

// Friendly messages for trap_visit's CHECK constraints (Postgres error code
// 23514), keyed by the violated constraint's name — otherwise these surface
// to the client as a raw, unreadable Postgres error object.
const CHECK_CONSTRAINT_MESSAGES: Record<string, string> = {
  why_trap_not_functioning_check:
    'Why Trap Not Functioning is required when Trap Functioning is "functioning but not normally" or "not functioning".',
  why_fish_not_processed_check:
    'Why Fish Not Processed is required when Fish Processed indicates no data was recorded.',
}

export default (mainRouter: Router) => {
  mainRouter.use('/trap-visit', trapVisitRouter)

  trapVisitRouter.post('/', isAuthorized(), async (req, res) => {
    try {
      const trapVisitValues = req.body
      const createdTrapVisit = await postTrapVisit(trapVisitValues)
      res.status(200).send(createdTrapVisit)
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).send({
          error: 'This crew member is already assigned to this trap visit.',
        })
      }
      if (error.code === '23514') {
        return res.status(400).send({
          error:
            CHECK_CONSTRAINT_MESSAGES[error.constraint] ??
            'This trap visit violates a data rule.',
        })
      }
      console.error(error)
      res.status(400).send(error)
    }
  })

  // GET /trap-visit/dropdowns
  trapVisitRouter.get('/dropdowns/:userId', async (req, res) => {
    const userId = req.params?.userId || ''
    try {
      const trapVisitDropdowns = await getAllTrapVisitDropdowns(userId)
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
        const { allTime } = req.query
        const trapVisits = await getProgramTrapVisits(
          programId,
          allTime === 'true'
        )
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
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).send({
          error: 'This crew member is already assigned to this trap visit.',
        })
      }
      if (error.code === '23514') {
        return res.status(400).send({
          error:
            CHECK_CONSTRAINT_MESSAGES[error.constraint] ??
            'This trap visit violates a data rule.',
        })
      }
      console.error(error)
      res.status(400).send(error)
    }
  })

  trapVisitRouter.delete('/:trapVisitId', async (req, res) => {
    try {
      const { trapVisitId } = req.params
      const deletedTrapVisitResponse = await deleteTrapVisit(trapVisitId)
      res.status(200).json({ deleted: deletedTrapVisitResponse })
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
        const trapSetupDefaultValues =
          await getVisitSetupDefaultValues(personnelId)
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
