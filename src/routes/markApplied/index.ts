import { Router } from 'express'
import { putMarkApplied } from '../../models/catchRaw/markApplied'

const markAppliedRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/mark-applied', markAppliedRouter)

  markAppliedRouter.put('/:markAppliedId', async (req, res) => {
    try {
      const { markAppliedId } = req.params
      const updated = await putMarkApplied(markAppliedId, req.body)
      res.status(200).send(updated)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
