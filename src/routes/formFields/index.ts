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
  // ?programId=... scopes the merge to that program's own options + the
  // shared/global set (see getOptionsByFormFieldIds); omit it for the global
  // set only.
  formFieldsRouter.get('/:formFieldId/options', async (req, res) => {
    try {
      const formFieldId = Number(req.params.formFieldId)
      const programId = req.query.programId
        ? Number(req.query.programId)
        : null
      const grouped = await getOptionsByFormFieldIds([formFieldId], programId)
      res.status(200).send({ options: grouped[formFieldId] ?? [] })
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // Same ?programId= scoping as GET above — replaces only that program's own
  // options (or the global set, if omitted) without touching any other
  // program's rows for this field. See replaceFormFieldOptions/
  // scopedOptionsQuery for how that boundary is enforced.
  formFieldsRouter.put('/:formFieldId/options', async (req, res) => {
    try {
      const formFieldId = Number(req.params.formFieldId)
      const programId = req.query.programId
        ? Number(req.query.programId)
        : (req.body?.programId ?? null)
      const options = await replaceFormFieldOptions({
        formFieldId,
        options: req.body?.options,
        programId,
      })
      res.status(200).send({ options })
    } catch (error: any) {
      if (error.code === '23505') {
        return res
          .status(409)
          .send({ error: 'That option already exists for this field.' })
      }
      console.error(error)
      // A thrown Error's .message is non-enumerable, so res.send(error) alone
      // serializes to '{}' — send { error: message } for anything that set
      // .status deliberately (see replaceFormFieldOptions), matching the
      // POST handler above.
      res
        .status(error?.status ?? 400)
        .send(error?.status ? { error: error.message } : error)
    }
  })
}
