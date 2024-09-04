import express from 'express'
import { isAuthenticated } from '../middleware/auth-middleware'
import trapVisitRouter from './trapVisit'
import userRouter from './user'
import programRouter from './program'
import catchRawRouter from './catchRaw'
import releaseRouter from './release'
import releaseSiteRouter from './releaseSite'
import personnelRouter from './personnel'
import trapLocationsRouter from './trapLocations'
import fishMeasureProtocolRouter from './fishMeasureProtocol'
import hatcheryInfoRouter from './hatcheryInfo'
import permitInfoRouter from './permitInfo'
import programPersonnelTeamRouter from './programPersonnelTeam'
import reportsRouter from './reports'

const mainRouter = express.Router()

mainRouter.use('/', isAuthenticated)

trapVisitRouter(mainRouter)
userRouter(mainRouter)
programRouter(mainRouter)
catchRawRouter(mainRouter)
releaseRouter(mainRouter)
releaseSiteRouter(mainRouter)
personnelRouter(mainRouter)
trapLocationsRouter(mainRouter)
fishMeasureProtocolRouter(mainRouter)
hatcheryInfoRouter(mainRouter)
permitInfoRouter(mainRouter)
releaseSiteRouter(mainRouter)
programPersonnelTeamRouter(mainRouter)
reportsRouter(mainRouter)

export default mainRouter
