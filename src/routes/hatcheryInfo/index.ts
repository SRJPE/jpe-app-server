import { Router } from 'express'
import {
  getHatcheryInfo,
  postHatcheryInfo,
  updateHatcheryInfo,
} from '../../models/hatcheryInfo'
import {
  isAuthorized,
  requireProgramMatch,
} from '../../middleware/auth-middleware'

const hatcheryInfoRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/hatchery-info', hatcheryInfoRouter)

  // GET
  hatcheryInfoRouter.get('/:programId', isAuthorized(), async (req, res) => {
    try {
      const { programId } = req.params
      const hatcheryInfo = await getHatcheryInfo(programId)
      res.status(200).send(hatcheryInfo)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // POST
  hatcheryInfoRouter.post('/', async (req, res) => {
    try {
      const hatcheryInfoValues = req.body
      const createdHatcheryInfo = await postHatcheryInfo(hatcheryInfoValues)
      res.status(200).send(createdHatcheryInfo)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}

// PATCH
hatcheryInfoRouter.put(
  '/:id',
  isAuthorized(),
  requireProgramMatch('hatcheryInfo', 'id'),
  async (req, res) => {
    try {
      const { id } = req.params
      const updatedValues = req.body
      const updatedHatcheryInfo = await updateHatcheryInfo({
        id,
        updatedValues,
      })
      res.status(200).send(updatedHatcheryInfo)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  },
)
