import { Router } from 'express'
import { postTrapCoordinates } from '../../models/trapVisit/trapCoordinates'

const trapCoordinatesRouter = Router({ mergeParams: true })

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/trap-coordinates', trapCoordinatesRouter)
}
