import { Router } from 'express'
import { getAllFormFields, postFormField } from '../../models/program/formFields'
import {
  getOptionsByFormFieldIds,
  replaceFormFieldOptions,
} from '../../models/program/formFieldOptions'
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
    } catch (error: any) {
      if (error.code === '23505') {
        return res
          .status(409)
          .send({ error: 'That option already exists for this field.' })
      }
      console.error(error)
      res.status(error?.status ?? 400).send(
        error?.status === 400 ? { error: error.message } : error
      )
    }
  })

  // '/units' is a literal and this is two segments, so no route-order conflict.
  formFieldsRouter.get('/:formFieldId/options', async (req, res) => {
    try {
      const formFieldId = Number(req.params.formFieldId)
      const grouped = await getOptionsByFormFieldIds([formFieldId])
      res.status(200).send({ options: grouped[formFieldId] ?? [] })
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  formFieldsRouter.put('/:formFieldId/options', async (req, res) => {
    try {
      const formFieldId = Number(req.params.formFieldId)
      const options = await replaceFormFieldOptions({
        formFieldId,
        options: req.body?.options,
      })
      res.status(200).send({ options })
    } catch (error: any) {
      if (error.code === '23505') {
        return res
          .status(409)
          .send({ error: 'That option already exists for this field.' })
      }
      console.error(error)
      res.status(400).send(error)
    }
  })
}
