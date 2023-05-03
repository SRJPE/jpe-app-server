import { Router } from 'express'
import { getAllReleaseSites, postReleaseSite } from '../../models/releaseSite'

const releaseSiteRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/release-site', releaseSiteRouter)

  // GET ALL
  releaseSiteRouter.get('/', async (req, res) => {
    try {
      const release = await getAllReleaseSites()
      res.status(200).send(release)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // POST
  releaseSiteRouter.post('/', async (req, res) => {
    try {
      const releaseSiteValues = req.body
      const createdReleaseSite = await postReleaseSite(releaseSiteValues)
      res.status(200).send(createdReleaseSite)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
