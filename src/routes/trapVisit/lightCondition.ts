import { Router } from 'express'
import { getLightConditions } from '../../models/trapVisit/lightCondition'

const lightConditionRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/light-condition', lightConditionRouter)

  //GET
  lightConditionRouter.get('/', async (req, res) => {
    try {
      const result = await getLightConditions()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
