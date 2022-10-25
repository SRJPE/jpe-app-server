import express from 'express'
import { isAuthenticated } from '../middleware/auth-middleware'
import testingRouter from './testing'
import azureTestingRouter from './azureTesting'
import trapVisitRouter from './trapVisit'
import userRouter from './user'
import programRouter from './program'

const mainRouter = express.Router()

mainRouter.use('/', isAuthenticated)
testingRouter(mainRouter)
azureTestingRouter(mainRouter)

trapVisitRouter(mainRouter)
userRouter(mainRouter)
programRouter(mainRouter)

export default mainRouter
