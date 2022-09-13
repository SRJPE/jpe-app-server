import express from 'express'
import testingRouter from './testing'
import azureTestingRouter from './azureTesting'

const mainRouter = express.Router()
testingRouter(mainRouter)
azureTestingRouter(mainRouter)

export default mainRouter
