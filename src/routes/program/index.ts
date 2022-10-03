import { Router } from 'express'

const programRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/program', programRouter)

  // GET /program/
}
