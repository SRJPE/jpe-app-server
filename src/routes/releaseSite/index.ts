import { Router } from 'express'
import { getAllReleaseSites } from '../../models/releaseSite'

const releaseRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/release-site', releaseRouter)

  // GET ALL
  releaseRouter.get('/', async (req, res) => {
    try {
      const release = await getAllReleaseSites()
      res.status(200).send(release)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
