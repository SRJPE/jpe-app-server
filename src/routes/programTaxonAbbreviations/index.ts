import { Router } from 'express'
import {
  getProgramTaxonAbbreviationsList,
  createProgramTaxonAbbreviation,
  updateProgramTaxonAbbreviation,
  deleteProgramTaxonAbbreviation,
} from '../../models/program/taxonAbbreviations'
import { isAuthorized } from '../../middleware/auth-middleware'

const programTaxonAbbreviationsRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use(
    '/program-taxon-abbreviations',
    programTaxonAbbreviationsRouter
  )

  programTaxonAbbreviationsRouter.get(
    '/:programId',
    isAuthorized(),
    async (req, res) => {
      try {
        const { programId } = req.params
        const rows = await getProgramTaxonAbbreviationsList(programId)
        res.status(200).send(rows)
      } catch (error) {
        console.error(error)
        res.status(400).send(error)
      }
    }
  )

  programTaxonAbbreviationsRouter.post(
    '/:programId',
    isAuthorized(),
    async (req, res) => {
      try {
        const { programId } = req.params
        const { taxonCode, abbreviationCode, isFullName } = req.body ?? {}
        if (!taxonCode || !abbreviationCode) {
          return res
            .status(400)
            .send({ error: 'taxonCode and abbreviationCode are required.' })
        }
        const created = await createProgramTaxonAbbreviation({
          programId,
          taxonCode,
          abbreviationCode,
          isFullName: !!isFullName,
        })
        res.status(200).send(created)
      } catch (error: any) {
        console.error(error)
        res
          .status(error?.status ?? 400)
          .send(error?.status ? { error: error.message } : error)
      }
    }
  )

  // programId lives in the path, not the body, because isAuthorized() checks
  // req.params.programId — a body-only id would get no authorization at all
  // (see the same convention on POST/PATCH /program-fields/:programId/reorder).
  programTaxonAbbreviationsRouter.patch(
    '/:programId/:id',
    isAuthorized(),
    async (req, res) => {
      try {
        const { programId, id } = req.params
        const updated = await updateProgramTaxonAbbreviation({
          id,
          programId,
          updatedValues: req.body ?? {},
        })
        res.status(200).send(updated)
      } catch (error: any) {
        console.error(error)
        res
          .status(error?.status ?? 400)
          .send(error?.status ? { error: error.message } : error)
      }
    }
  )

  programTaxonAbbreviationsRouter.delete(
    '/:programId/:id',
    isAuthorized(),
    async (req, res) => {
      try {
        const { programId, id } = req.params
        await deleteProgramTaxonAbbreviation({ id, programId })
        res.status(204).send()
      } catch (error: any) {
        console.error(error)
        res
          .status(error?.status ?? 400)
          .send(error?.status ? { error: error.message } : error)
      }
    }
  )
}
