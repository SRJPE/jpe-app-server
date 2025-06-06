import { Router } from 'express'
import {
  deleteCatchRaw,
  getCatchRawRecord,
  getProgramCatchRawRecords,
  getTrapVisitCatchRawRecords,
  postCatchRaw,
  putCatchRaw,
} from '../../models/catchRaw'
import { isAuthorized } from '../../middleware/auth-middleware'

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

  catchRawRouter.get(
    '/program/:programId',
    isAuthorized(),
    async (req, res) => {
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
    }
  )

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
      const catchRawObject = req.body
      const editedCatchRawRecord = await putCatchRaw(catchRawId, catchRawObject)
      res.status(200).send(editedCatchRawRecord)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  catchRawRouter.delete('/:catchRawId', async (req, res) => {
    try {
      const { catchRawId } = req.params
      const deletedCatchRawResponse = await deleteCatchRaw(catchRawId)
      res.status(200).send(deletedCatchRawResponse)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
