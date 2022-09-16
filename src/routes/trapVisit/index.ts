import { Router } from 'express'
import trapFunctionalityRouter from './trapFunctionality'
import { getAllTrapVisitDropdowns } from '../../services/trapVisit'

const trapVisitRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/trap-visit', trapVisitRouter)

  // GET /charter/
  trapVisitRouter.get('/dropdowns', async (req, res) => {
    try {
      const trapVisitDropdowns = await getAllTrapVisitDropdowns()
      res.status(200).send(trapVisitDropdowns)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  trapFunctionalityRouter(trapVisitRouter)
}
