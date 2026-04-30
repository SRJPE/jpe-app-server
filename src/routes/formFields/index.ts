import { Router } from 'express'
import { getAllFormFields, postFormField } from '../../models/program/formFields'
import { getUnits } from '../../models/trapVisit/unit'

const formFieldsRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/form-fields', formFieldsRouter)

  formFieldsRouter.get('/', async (req, res) => {
    try {
      const formFields = await getAllFormFields()
      res.status(200).send(formFields)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  formFieldsRouter.get('/units', async (req, res) => {
    try {
      const units = await getUnits()
      res.status(200).send(units)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  formFieldsRouter.post('/', async (req, res) => {
    try {
      const createdFormField = await postFormField(req.body)
      res.status(200).send(createdFormField)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
