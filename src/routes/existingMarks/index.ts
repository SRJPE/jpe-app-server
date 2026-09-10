import { Router } from 'express'
import {
  getProgramExistingMarks,
  postExistingMarks,
  putExistingMark,
  deleteExistingMark,
} from '../../models/catchRaw/existingMarks'

const existingMarksRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/existing-marks', existingMarksRouter)

  // Create existing-mark (recapture) records. Body is a single object or an
  // array; knex.insert handles both. Used to associate existing catch records
  // with a release as mark recaptures.
  existingMarksRouter.post('/', async (req, res) => {
    try {
      const created = await postExistingMarks(req.body)
      res.status(200).send(created)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

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

  existingMarksRouter.delete('/:existingMarkId', async (req, res) => {
    try {
      const { existingMarkId } = req.params
      const deleted = await deleteExistingMark(existingMarkId)
      res.status(200).json({ deleted })
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
