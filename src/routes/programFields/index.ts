import { Router } from 'express'
import {
  getProgramFormFields,
  postProgramFormField,
  updateProgramFormField,
  reorderProgramFormFields,
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
    } catch (error: any) {
      if (error.code === '23505' || error.status === 409) {
        return res.status(409).send({
          error:
            error.message ??
            'This form field is already enabled for this program and equipment.',
        })
      }
      console.error(error)
      res.status(400).send(error)
    }
  })

  /**
   * Bulk-renumber order_index for one program's form fields.
   *
   * programId lives in the PATH, not the body, because isAuthorized() checks
   * req.params.programId — a body-only id would get no authorization at all.
   * Two segments also means this never collides with PATCH /:id below.
   */
  programFieldsRouter.patch(
    '/:programId/reorder',
    isAuthorized(),
    async (req, res) => {
      try {
        const { programId } = req.params
        const updated = await reorderProgramFormFields({
          programId,
          items: req.body?.items,
        })
        res.status(200).send(updated)
      } catch (error: any) {
        console.error(error)
        res
          .status(error?.status ?? 400)
          .send(error?.status === 400 ? { error: error.message } : error)
      }
    }
  )

  programFieldsRouter.patch('/:id', isAuthorized(), async (req, res) => {
    try {
      const { id } = req.params
      const updatedValues = req.body
      const updatedProgramField = await updateProgramFormField({
        id,
        updatedValues,
      })
      res.status(200).send(updatedProgramField)
    } catch (error: any) {
      if (error.code === '23505' || error.status === 409) {
        return res.status(409).send({
          error:
            error.message ??
            'This form field is already enabled for this program and equipment.',
        })
      }
      console.error(error)
      res.status(error?.status === 404 ? 404 : 400).send(
        error?.status ? { error: error.message } : error
      )
    }
  })
}
