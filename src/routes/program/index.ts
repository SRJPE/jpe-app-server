import { Router } from 'express'
import {
  getPersonnelPrograms,
  postProgram,
  postProgramFilesToAzure,
  updateProgram,
} from '../../models/program'
import multer from 'multer'

const programRouter = Router({ mergeParams: true })
const upload = multer()

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

  programRouter.post('/files', upload.single('file'), async (req, res) => {
    try {
      const file = req.file
      const uploadBlobResponse = await postProgramFilesToAzure(file)

      res.status(200).send(uploadBlobResponse)
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
