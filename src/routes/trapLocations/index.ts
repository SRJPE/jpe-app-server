import { Router } from 'express'
import { getProgramTrapLocations, postTrapLocations } from '../../models/trapLocations'

const trapLocationsRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/trap-locations', trapLocationsRouter)

  // GET PROGRAM'S TRAP LOCATIONS
  trapLocationsRouter.get('/:programId', async (req, res) => {
    try {
      const { programId } = req.params
      const programTrapLocations = await getProgramTrapLocations(programId)
      res.status(200).send(programTrapLocations)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // POST
  trapLocationsRouter.post('/', async (req, res) => {
    try {
      const trapLocationsValues = req.body
      const createdTrapLocations = await postTrapLocations(trapLocationsValues)
      res.status(200).send(createdTrapLocations)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
