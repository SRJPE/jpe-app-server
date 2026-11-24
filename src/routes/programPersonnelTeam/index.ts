import { Router } from 'express'
import { getProgramPersonnelTeam } from '../../models/programPersonnelTeam'
import { isAuthorized } from '../../middleware/auth-middleware'

const programPersonnelTeamRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/program-personnel-team', programPersonnelTeamRouter)

  // get personnel associated with program
  programPersonnelTeamRouter.get(
    '/:programId',
    isAuthorized(),
    async (req, res) => {
      try {
        const { programId } = req.params
        const programPersonnel = await getProgramPersonnelTeam(programId)
        res.status(200).send(programPersonnel)
      } catch (error) {
        console.error(error)
        res.status(400).send(error)
      }
    },
  )
}
