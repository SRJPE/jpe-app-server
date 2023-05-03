import { Router } from 'express'
import { getHatcheryInfo, postHatcheryInfo } from '../../models/hatcheryInfo'

const hatcheryInfoRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/hatchery-info', hatcheryInfoRouter)

  // GET
  hatcheryInfoRouter.get('/:programId', async (req, res) => {
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
