import { Router } from 'express'
import { getVisitTypes } from '../../models/trapVisit/visitType'

const visitTypeRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/visit-type', visitTypeRouter)

  //GET
  visitTypeRouter.get('/', async (req, res) => {
    try {
      const result = await getVisitTypes()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
