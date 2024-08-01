import { Router } from 'express'
import {
  getPersonnelPrograms,
  postProgram,
  updateProgram,
} from '../../models/program'
import { getBiWeeklyPassageSummary } from '../../models/reports'

const programRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/program', programRouter)

  // get all programs for a certain personnel
  // GET /program/personnel/:id
  programRouter.get('/personnel/:id', async (req, res) => {
    try {
      const { id } = req.params
      const usersPrograms = await getPersonnelPrograms(id)
      res.status(200).send(usersPrograms)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  //bi-weekly passage summary report
  programRouter.get('/biweeklyPassageSummary/:id', async (req, res) => {
    try {
      const { id } = req.params
      const biweeklyPassageSummaryReport = await getBiWeeklyPassageSummary(id)
      res.status(200).send(biweeklyPassageSummaryReport)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  programRouter.post('/', async (req, res) => {
    try {
      const programValues = req.body
      const createdProgram = await postProgram(programValues)
      res.status(200).send(createdProgram)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  programRouter.put('/:id', async (req, res) => {
    try {
      const { id } = req.params
      const updatedValues = req.body
      const updatedProgram = await updateProgram({ id, updatedValues })
      res.status(200).send(updatedProgram)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
