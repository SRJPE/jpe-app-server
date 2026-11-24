import { Router } from 'express'
import {
  getPersonnelPrograms,
  postProgram,
  postProgramFilesToAzure,
  updateProgram,
} from '../../models/program'
import multer from 'multer'
import {
  requireLead,
  requireSelfOrLead,
} from '../../middleware/auth-middleware'

const programRouter = Router({ mergeParams: true })
const upload = multer()

export default (mainRouter: Router) => {
  mainRouter.use('/program', programRouter)

  // get all programs for a certain personnel
  // GET /program/personnel/:id
  // Self-or-lead: a user fetching their own program list, or a lead looking
  // up a different designated lead's programs during program creation.
  programRouter.get(
    '/personnel/:id',
    requireSelfOrLead('id'),
    async (req, res) => {
      try {
        const { id } = req.params
        const usersPrograms = await getPersonnelPrograms(id)
        res.status(200).send(usersPrograms)
      } catch (error) {
        console.error(error)
        res.status(400).send(error)
      }
    },
  )

  // Leads-only — creates a brand-new monitoring program (trap sites, crew,
  // hatchery info, protocols, permits all at once).
  programRouter.post('/', requireLead(), async (req, res) => {
    try {
      const programValues = req.body
      const createdProgram = await postProgram(programValues)
      res.status(200).send(createdProgram)
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).send({
          error: "This personnel is already on this program's team.",
        })
      }
      console.error(error)
      res.status(400).send(error)
    }
  })

  // Leads-only — part of the same program-creation flow as POST /.
  programRouter.post(
    '/files',
    requireLead(),
    upload.single('file'),
    async (req, res) => {
      try {
        const file = req.file
        const uploadBlobResponse = await postProgramFilesToAzure(file)

        res.status(200).send(uploadBlobResponse)
      } catch (error) {
        console.error(error)
        res.status(400).send(error)
      }
    },
  )

  // Leads-only, not a stricter program-ownership check: the submitting user
  // isn't guaranteed to be on the new program's team yet (only added if they
  // listed themselves in the crew-members step), so this follows POST /'s
  // gate rather than isAuthorized()'s program-match.
  programRouter.put('/:id', requireLead(), async (req, res) => {
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
