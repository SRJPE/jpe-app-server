import { Router } from 'express'
import {
  getAllPersonnel,
  getPersonnel,
  postPersonnel,
  updatePersonnel,
  getPersonnelByAzureUid,
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
}
