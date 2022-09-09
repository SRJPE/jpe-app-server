import { Router } from 'express'
import { getTesting } from '../models/testing'

const testingRouter = Router()

export default (mainRouter: Router) => {
  mainRouter.use('/testing', testingRouter)

  //GET TESTING
  testingRouter.get('/', async (req, res) => {
    try {
      const result = await getTesting()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
