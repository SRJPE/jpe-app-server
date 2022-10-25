import { Router } from 'express'
import { getReleasePurposeOptions } from '../../models/trapVisit/releasePurpose'

const releasePurposeRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/release-purpose', releasePurposeRouter)

  //GET
  releasePurposeRouter.get('/', async (req, res) => {
    try {
      const result = await getReleasePurposeOptions()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
