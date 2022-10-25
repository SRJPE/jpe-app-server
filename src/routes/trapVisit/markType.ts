import { Router } from 'express'
import { getMarkTypes } from '../../models/trapVisit/markType'

const markTypeRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/mark-type', markTypeRouter)

  //GET
  markTypeRouter.get('/', async (req, res) => {
    try {
      const result = await getMarkTypes()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
