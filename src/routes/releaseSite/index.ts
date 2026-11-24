import { Router } from 'express'
import { getAllReleaseSites, postReleaseSite } from '../../models/releaseSite'
import { requireLead } from '../../middleware/auth-middleware'

const releaseSiteRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/release-site', releaseSiteRouter)

  // GET ALL — no frontend caller found in either client repo; leads-only as
  // a zero-regression-risk stopgap (release sites have no direct programId
  // column, only a trap_locations_id, so a full program-match would need a
  // join that isn't worth it for an apparently-unused route).
  releaseSiteRouter.get('/', requireLead(), async (req, res) => {
    try {
      const release = await getAllReleaseSites()
      res.status(200).send(release)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // POST — same reasoning as GET above.
  releaseSiteRouter.post('/', requireLead(), async (req, res) => {
    try {
      const releaseSiteValues = req.body
      const createdReleaseSite = await postReleaseSite(releaseSiteValues)
      res.status(200).send(createdReleaseSite)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
