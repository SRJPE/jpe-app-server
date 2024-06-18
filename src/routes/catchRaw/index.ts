import { Router } from 'express'
import {
  getCatchRawRecord,
  getProgramCatchRawRecords,
  getTrapVisitCatchRawRecords,
  postCatchRaw,
  putCatchRaw,
} from '../../models/catchRaw'

const catchRawRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/catch-raw', catchRawRouter)

  catchRawRouter.get('/:catchRawId', async (req, res) => {
    const { catchRawId } = req.params
    const catchRawRecord = await getCatchRawRecord(catchRawId)
    try {
      res.status(200).send(catchRawRecord)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  catchRawRouter.get('/trap-visit/:trapVisitId', async (req, res) => {
    try {
      const { trapVisitId } = req.params
      const catchRawRecords = await getTrapVisitCatchRawRecords(trapVisitId)
      res.status(200).send(catchRawRecords)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  catchRawRouter.get('/program/:programId', async (req, res) => {
    try {
      const { programId } = req.params
      const { limit } = req.query
      const parsedLimit = limit ? Number(limit) : undefined
      const catchRawRecords = await getProgramCatchRawRecords(
        programId,
        parsedLimit
      )
      res.status(200).send(catchRawRecords)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  catchRawRouter.post('/', async (req, res) => {
    try {
      // const { trapVisitId } = req.params
      const catchRawValues = req.body
      const createdCatchRawRecord = await postCatchRaw(catchRawValues)
      res.status(200).send(createdCatchRawRecord)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  catchRawRouter.put('/:catchRawId', async (req, res) => {
    try {
      const { catchRawId } = req.params
      const catchRawValues = req.body
      const editedCatchRawRecord = await putCatchRaw(catchRawId, catchRawValues)
      res.status(200).send(editedCatchRawRecord)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
