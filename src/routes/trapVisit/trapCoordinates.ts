import { Router } from 'express'
import { postTrapCoordinates } from '../../models/trapVisit/trapCoordinates'

const trapCoordinatesRouter = Router({ mergeParams: true })

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/trap-coordinates', trapCoordinatesRouter)

  trapCoordinatesRouter.post('/', async (req, res) => {
    try {
      const trapCoordinatesValues = req.body
      const createdTrapCoordinates = await postTrapCoordinates(
        trapCoordinatesValues
      )
      res.status(200).send(createdTrapCoordinates)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
