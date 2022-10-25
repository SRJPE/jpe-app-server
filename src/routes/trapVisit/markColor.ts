import { Router } from 'express'
import { getMarkColors } from '../../models/trapVisit/markColor'

const markColorRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/mark-color', markColorRouter)

  //GET
  markColorRouter.get('/', async (req, res) => {
    try {
      const result = await getMarkColors()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
