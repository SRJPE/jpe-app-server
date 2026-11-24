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
import { isAuthorized, requireLead } from '../../middleware/auth-middleware'

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

  // POST — leads-only (creates+attaches a new crew member to their team).
  personnelRouter.post('/', requireLead(), async (req, res) => {
    try {
      const personnelValues = req.body
      const createdPersonnel = await postPersonnel(personnelValues)
      res.status(200).send(createdPersonnel)
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

  // POST — leads-only (adds an existing personnel record to a program's team).
  personnelRouter.post('/team', requireLead(), async (req, res) => {
    try {
      const personnelValues = req.body
      const createdPersonnel = await addPersonnelToProgramTeam({
        programId: personnelValues.programId,
        personnelId: personnelValues.personnelId,
      })
      res.status(200).send(createdPersonnel)
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

  // DELETE — leads-only (removes a personnel record from a program's team).
  personnelRouter.delete('/team', requireLead(), async (req, res) => {
    try {
      const personnelValues = req.body
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

  // Self-service only (the signed-in user editing their own profile) —
  // isAuthorized() 403s unless :azureUid is the caller's own.
  personnelRouter.put('/:azureUid', isAuthorized(), async (req, res) => {
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

  // Leads-only — this edits an arbitrary *teammate's* personnel record (crew
  // management in both the mobile app's CrewTabPanel and the dashboard's
  // Configuration Tables page), not a self-edit, so isAuthorized()'s
  // caller-must-match-:personnelId check would wrongly 403 the real caller.
  personnelRouter.put('/id/:personnelId', requireLead(), async (req, res) => {
    try {
      const { personnelId: id } = req.params
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
