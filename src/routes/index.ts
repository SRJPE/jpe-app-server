import express from 'express'
import testingRouter from './testing'

const mainRouter = express.Router()
testingRouter(mainRouter)

export default mainRouter
