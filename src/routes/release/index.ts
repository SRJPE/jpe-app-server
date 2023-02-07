import { Router } from 'express'
import {
  postRelease,
  getRelease,
} from '../../models/release'


const releaseRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/release', releaseRouter)

  // GET /release/:releaseId
  releaseRouter.get('/:releaseId', async (req, res) => {
    try {
      const { releaseId } = req.params
      const release = await getRelease(releaseId)
      res.status(200).send(release)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // POST /release
  releaseRouter.post('/', async (req, res) => {
    try {
      const releaseValues = req.body
      const createdRelease = await postRelease(releaseValues)
      res.status(200).send(createdRelease)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
