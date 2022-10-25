import { Router } from 'express'

const userRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/user', userRouter)

  // GET /user/
}
