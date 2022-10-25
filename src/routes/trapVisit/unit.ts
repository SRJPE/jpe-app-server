import { Router } from 'express'
import { getUnits } from '../../models/trapVisit/unit'

const unitRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/unit', unitRouter)

  //GET
  unitRouter.get('/', async (req, res) => {
    try {
      const result = await getUnits()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
