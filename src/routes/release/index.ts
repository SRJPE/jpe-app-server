import { Router } from 'express'
import {
  postRelease,
  getRelease,
  getProgramReleases,
  putRelease,
  deleteRelease,
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

  releaseRouter.get('/program/:programId', async (req, res) => {
    try {
      const { programId } = req.params
      const catchRawRecords = await getProgramReleases(programId)
      res.status(200).send(catchRawRecords)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // PUT /release/:releaseId
  releaseRouter.put('/:releaseId', async (req, res) => {
    try {
      const { releaseId } = req.params
      const updatedRelease = await putRelease(releaseId, req.body)
      res.status(200).send(updatedRelease)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // DELETE /release/:releaseId
  releaseRouter.delete('/:releaseId', async (req, res) => {
    try {
      const { releaseId } = req.params
      const deleted = await deleteRelease(releaseId)
      res.status(200).json({ deleted })
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
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).send({
          error: 'This crew member is already assigned to this release.',
        })
      }
      console.error(error)
      res.status(400).send(error)
    }
  })
}
