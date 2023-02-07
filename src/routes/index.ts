import express from 'express'
import { isAuthenticated } from '../middleware/auth-middleware'
import trapVisitRouter from './trapVisit'
import userRouter from './user'
import programRouter from './program'
import catchRawRouter from './catchRaw'
import releaseRouter from './release'
import releaseSiteRouter from './releaseSite'

const mainRouter = express.Router()

mainRouter.use('/', isAuthenticated)

trapVisitRouter(mainRouter)
userRouter(mainRouter)
programRouter(mainRouter)
catchRawRouter(mainRouter)
releaseRouter(mainRouter)
releaseSiteRouter(mainRouter)

export default mainRouter
