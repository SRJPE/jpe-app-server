import { Router } from 'express'
import { getProgramExistingMarks } from '../../models/catchRaw/existingMarks'

const existingMarksRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/existing-marks', existingMarksRouter)

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
