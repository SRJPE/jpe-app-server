import { Router } from 'express'
import {
  updatePermitInfo,
  getProgramPermits,
  postPermitInfo,
} from '../../models/permitInfo'

const permitInfoRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/permit-info', permitInfoRouter)

  // GET PROGRAM'S PERMITS
  permitInfoRouter.get('/:programId', async (req, res) => {
    try {
      const { programId } = req.params
      const programPermits = await getProgramPermits(programId)
      res.status(200).send(programPermits)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // POST
  permitInfoRouter.post('/', async (req, res) => {
    try {
      const permitInfoValues = req.body
      const createdPermitInfo = await postPermitInfo(permitInfoValues)
      res.status(200).send(createdPermitInfo)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // PUT
  permitInfoRouter.put('/:id', async (req, res) => {
    try {
      const { id } = req.params
      const permitInfoValues = req.body
      const updatedPermitInfo = await updatePermitInfo({
        id,
        permitInfoValues,
      })
      res.status(200).send(updatedPermitInfo)
    } catch (error) {
      res.status(400).send(error)
    }
  })
}