import { Router } from 'express'
import {
  getProgramExistingMarks,
  putExistingMark,
} from '../../models/catchRaw/existingMarks'

const existingMarksRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/existing-marks', existingMarksRouter)

  existingMarksRouter.put('/:existingMarkId', async (req, res) => {
    try {
      const { existingMarkId } = req.params
      const updated = await putExistingMark(existingMarkId, req.body)
      res.status(200).send(updated)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  existingMarksRouter.get('/program/:programId', async (req, res) => {
    try {
      const { programId } = req.params
      const catchRawRecords = await getProgramExistingMarks(programId)
      res.status(200).send(catchRawRecords)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
