import { Router } from 'express'
import {
  getAllPersonnel,
  getPersonnel,
  postPersonnel,
  updatePersonnel,
  getPersonnelByAzureUid,
  addPersonnelToProgramTeam,
  removePersonnelFromProgramTeam,
  updatePersonnelById,
} from '../../models/personnel'
import { isAuthorized } from '../../middleware/auth-middleware'

const personnelRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/personnel', personnelRouter)

  // GET
  personnelRouter.get('/', async (req, res) => {
    try {
      const personnel = await getAllPersonnel()
      res.status(200).send(personnel)
    } catch (error) {
      console.error(error)
      res.status(400)
    }
  })

  // GET
  personnelRouter.get('/:id', async (req, res) => {
    try {
      const { id } = req.params
      const personnel = await getPersonnel(id)
      res.status(200).send(personnel)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // GET
  personnelRouter.get('/azure/:azureUid', isAuthorized(), async (req, res) => {
    try {
      const { azureUid } = req.params
      const personnel = await getPersonnelByAzureUid(azureUid)
      res.status(200).send(personnel)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // POST
  personnelRouter.post('/', async (req, res) => {
    try {
      const personnelValues = req.body
      const createdPersonnel = await postPersonnel(personnelValues)
      res.status(200).send(createdPersonnel)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // POST
  personnelRouter.post('/team', async (req, res) => {
    try {
      const personnelValues = req.body
      const createdPersonnel = await addPersonnelToProgramTeam({
        programId: personnelValues.programId,
        personnelId: personnelValues.personnelId,
      })
      res.status(200).send(createdPersonnel)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // DELETE
  personnelRouter.delete('/team', async (req, res) => {
    try {
      const personnelValues = req.body
      console.log(req.body)
      const deletedPersonnelCount = await removePersonnelFromProgramTeam({
        programId: personnelValues.programId,
        personnelId: personnelValues.personnelId,
      })

      if (deletedPersonnelCount > 0) {
        return res
          .status(200)
          .json({ success: true, deletedCount: deletedPersonnelCount })
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'No record found' })
      }
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  personnelRouter.put('/:azureUid', async (req, res) => {
    try {
      const { azureUid } = req.params
      const personnelValues = req.body
      const updatedPersonnel = await updatePersonnel({
        azureUid,
        personnelValues,
      })
      res.status(200).send(updatedPersonnel)
    } catch (error) {
      res.status(400).send(error)
    }
  })

  personnelRouter.put('/id/:id', async (req, res) => {
    try {
      const { id } = req.params
      const personnelValues = req.body
      const updatedPersonnel = await updatePersonnelById({
        id,
        personnelValues,
      })
      res.status(200).send(updatedPersonnel)
    } catch (error) {
      res.status(400).send(error)
    }
  })
}
