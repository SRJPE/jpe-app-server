import express from 'express'
import { isAuthenticated } from '../middleware/auth-middleware'
import trapVisitRouter from './trapVisit'
import userRouter from './user'
import programRouter from './program'
import catchRawRouter from './catchRaw'

const mainRouter = express.Router()

mainRouter.use('/', isAuthenticated)

trapVisitRouter(mainRouter)
userRouter(mainRouter)
programRouter(mainRouter)
catchRawRouter(mainRouter)

export default mainRouter
