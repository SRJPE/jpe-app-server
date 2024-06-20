import { Router } from 'express'
import {
  getPersonnel,
  postPersonnel,
  updatePersonnel,
  getPersonnelbyAzureUid,
} from '../../models/personnel'

const personnelRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/personnel', personnelRouter)

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
  personnelRouter.get('/azure/:azureUid', async (req, res) => {
    try {
      const { azureUid } = req.params
      const personnel = await getPersonnelbyAzureUid(azureUid)
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

  personnelRouter.put('/:id', async (req, res) => {
    try {
      const { id } = req.params
      const personnelValues = req.body
      const updatedPersonnel = await updatePersonnel({ id, personnelValues })
      res.status(200).send(updatedPersonnel)
    } catch (error) {
      res.status(400).send(error)
    }
  })
}
