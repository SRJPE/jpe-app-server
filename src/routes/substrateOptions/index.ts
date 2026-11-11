import { Router } from 'express'
import {
  getSubstrateOptions,
  getHiddenDefaults,
  hideDefaultOption,
  createSubstrateOption,
  updateSubstrateOption,
  getExcludeGlobalOptions,
  setExcludeGlobalOptions,
} from '../../models/program/substrateOptions'
import { isAuthorized } from '../../middleware/auth-middleware'

const substrateOptionsRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/substrate-options', substrateOptionsRouter)

  substrateOptionsRouter.get('/:programId', isAuthorized(), async (req, res) => {
    try {
      const { programId } = req.params
      const [options, excludeGlobalOptions, hiddenDefaults] = await Promise.all([
        getSubstrateOptions(programId),
        getExcludeGlobalOptions(programId),
        getHiddenDefaults(programId),
      ])
      res.status(200).send({ options, excludeGlobalOptions, hiddenDefaults })
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // Suppresses one specific default (globalOptionId) for this program —
  // distinct from PUT .../settings, which hides EVERY default at once.
  // Unhide reuses PATCH /:programId/:id with { active: true } below, since
  // the shadow row this creates is program-owned like any other row.
  substrateOptionsRouter.post(
    '/:programId/hide-default',
    isAuthorized(),
    async (req, res) => {
      try {
        const { programId } = req.params
        const { globalOptionId } = req.body ?? {}
        if (!globalOptionId) {
          return res.status(400).send({ error: 'globalOptionId is required.' })
        }
        const hidden = await hideDefaultOption({ programId, globalOptionId })
        res.status(200).send(hidden)
      } catch (error: any) {
        console.error(error)
        res
          .status(error?.status ?? 400)
          .send(error?.status ? { error: error.message } : error)
      }
    }
  )

  substrateOptionsRouter.post('/:programId', isAuthorized(), async (req, res) => {
    try {
      const { programId } = req.params
      const { code, description } = req.body ?? {}
      if (!code || !description) {
        return res
          .status(400)
          .send({ error: 'code and description are required.' })
      }
      const created = await createSubstrateOption({ programId, code, description })
      res.status(200).send(created)
    } catch (error: any) {
      console.error(error)
      res
        .status(error?.status ?? 400)
        .send(error?.status ? { error: error.message } : error)
    }
  })

  substrateOptionsRouter.patch(
    '/:programId/:id',
    isAuthorized(),
    async (req, res) => {
      try {
        const { programId, id } = req.params
        const updated = await updateSubstrateOption({
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

  substrateOptionsRouter.put(
    '/:programId/settings',
    isAuthorized(),
    async (req, res) => {
      try {
        const { programId } = req.params
        const exclude = !!req.body?.excludeGlobalOptions
        const excludeGlobalOptions = await setExcludeGlobalOptions({
          programId,
          exclude,
        })
        res.status(200).send({ excludeGlobalOptions })
      } catch (error: any) {
        console.error(error)
        res
          .status(error?.status ?? 400)
          .send(error?.status ? { error: error.message } : error)
      }
    }
  )
}
