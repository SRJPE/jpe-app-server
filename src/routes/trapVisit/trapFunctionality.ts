import { Router } from 'express'
import { getTrapFunctionalities } from '../../models/trapFunctionality'

const trapFunctionalityRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/trap-functionality', trapFunctionalityRouter)

  //GET TESTING
  trapFunctionalityRouter.get('/', async (req, res) => {
    try {
      const result = await getTrapFunctionalities()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
