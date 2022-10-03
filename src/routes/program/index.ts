import { Router } from 'express'
import { getPersonnelPrograms } from '../../models/program'

const programRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/program', programRouter)

  // get all charters for a user
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
}
