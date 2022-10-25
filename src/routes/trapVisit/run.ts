import { Router } from 'express'
import { getRuns } from '../../models/trapVisit/run'

const runRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/run', runRouter)

  //GET
  runRouter.get('/', async (req, res) => {
    try {
      const result = await getRuns()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
