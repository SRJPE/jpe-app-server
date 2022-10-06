import { Router } from 'express'
import { postVisitSetupValues } from '../../models/trapVisit/visitSetup'
import { getVisitSetupDefaultValues } from '../../services/trapVisit'

const visitSetupRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/visit-setup', visitSetupRouter)

  visitSetupRouter.post('/:trapVisitId', async (req, res) => {
    try {
      const { trapVisitId } = req.params
      const visitSetupValues = req.body
      console.log('visitSetupValues', visitSetupValues)
      const postResponse = 'hello world'
      // const postResponse = await postVisitSetupValues(trapVisitId, visitSetupValues)
      res.status(200).send(postResponse)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  visitSetupRouter.get('/default/:personnelId', async (req, res) => {
    try {
      const { personnelId } = req.params
      const trapSetupDefaultValues = await getVisitSetupDefaultValues(
        personnelId
      )
      res.status(200).send(trapSetupDefaultValues)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
