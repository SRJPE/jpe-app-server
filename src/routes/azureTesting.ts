import { Router } from 'express'
import {
  selectQuery,
  insertQuery,
  updateQuery,
  deleteQuery,
} from '../models/azureTesting'

const azureTestingRouter = Router()

export default (mainRouter: Router) => {
  mainRouter.use('/azure-testing', azureTestingRouter)

  // GET FROM DB WITH SELECT STATEMENT
  azureTestingRouter.get('/', async (req, res) => {
    try {
      const result = await selectQuery()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // POST TO DB WITH INSERT STATEMENT
  azureTestingRouter.post('/', async (req, res) => {
    try {
      const result = await insertQuery()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // UPDATE TO DB WITH UPDATE STATEMENT
  azureTestingRouter.put('/', async (req, res) => {
    try {
      const result = await updateQuery()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // DELETE TO DB WITH DELETE STATEMENT
  azureTestingRouter.delete('/', async (req, res) => {
    try {
      const result = await deleteQuery()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
