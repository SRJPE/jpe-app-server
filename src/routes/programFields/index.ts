import { Router } from 'express'
import {
  getProgramFormFields,
  postProgramFormField,
  updateProgramFormField,
} from '../../models/program/formFields'
import { isAuthorized } from '../../middleware/auth-middleware'

const programFieldsRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/program-fields', programFieldsRouter)

  programFieldsRouter.get('/:programId', isAuthorized(), async (req, res) => {
    try {
      const { programId } = req.params
      const programFields = await getProgramFormFields(programId)
      res.status(200).send(programFields)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  programFieldsRouter.post('/', isAuthorized(), async (req, res) => {
    try {
      const values = req.body
      const createdProgramField = await postProgramFormField(values)
      res.status(200).send(createdProgramField)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  programFieldsRouter.patch('/:id', isAuthorized(), async (req, res) => {
    try {
      const { id } = req.params
      const updatedValues = req.body
      const updatedProgramField = await updateProgramFormField({
        id,
        updatedValues,
      })
      res.status(200).send(updatedProgramField)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
