import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import { getPersonnelByAzureUid } from '../models/personnel'
import { getPersonnelPrograms } from '../models/program'
import db from '../db'

const { knex } = db

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { authorization } = req.headers

  if (!authorization) return res.status(401).send({ message: 'Unauthorized' })

  if (authorization) {
    const [identifier, token] = authorization.split(' ')
    if (identifier !== 'Bearer')
      return res.status(401).send({ message: 'Invalid token' })
    try {
      passport.authenticate(
        'oauth-bearer',
        { session: false },
        (err, payload, info) => {
          if (err || !payload || !info) {
            console.error(err)
            return res
              .status(401)
              .send({ message: 'Token provided is not valid' })
          }

          const azureUid = info?.sub
          res.locals = {
            ...res.locals,
            azureUid,
          }
          return next()
        },
      )(req, res, next)
    } catch (e) {
      console.error(e)
      return res.status(401).send({ message: 'Token provided is not valid' })
    }
  }
}

// TO DO: Refactor for our use case
export function isAuthorized() {
  return async (req: Request, res: Response, next: Function) => {
    const { azureUid } = res.locals

    const tokenPersonnel = await getPersonnelByAzureUid(azureUid)
    const { id, email } = tokenPersonnel

    const tokenPrograms = await getPersonnelPrograms(id)
    const tokenProgramIds = tokenPrograms.map((program) => program.id)

    if (req.params.azureUid && req.params.azureUid !== azureUid) {
      return res
        .status(403)
        .send(`Access to the requested resource is forbidden for ${email}`)
    }

    if (
      req.params.personnelId &&
      tokenPersonnel.id !== Number(req.params.personnelId)
    ) {
      console.log('Personnel ID mismatch:', id, req.params.personnelId)
      return res
        .status(403)
        .send(`Access to the requested resource is forbidden for ${email}`)
    }

    if (
      req.params.programId &&
      !tokenProgramIds.includes(Number(req.params.programId))
    ) {
      console.log('Program ID mismatch:', tokenProgramIds, req.params.programId)
      return res
        .status(403)
        .send(`Access to the requested resource is forbidden for ${email}`)
    }

    // if (options.allowSameUser && azureUid === uid) return next()

    // if (!role) return res.status(403).send()

    // if (options.hasRole.includes(role)) return next()

    res.locals = {
      ...res.locals,
      tokenPersonnel,
      personnelPrograms: tokenPrograms,
      personnelProgramIds: tokenProgramIds,
    }

    return next()
  }
}

// Gates crew-provisioning actions (creating a B2C login, creating/attaching
// a personnel record, adding or removing a program's team member) to callers
// whose own personnel record has role 'lead' — mirrors the mobile app's
// existing (client-side-only) `userIsLead` gate on the same actions, now
// actually enforced server-side. Must run after isAuthorized() so res.locals
// doesn't need a second DB round-trip, but works standalone too (e.g. on
// routes with no programId/personnelId param for isAuthorized() to check).
export function requireLead() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { azureUid } = res.locals
      const tokenPersonnel =
        res.locals.tokenPersonnel ?? (await getPersonnelByAzureUid(azureUid))

      if (!tokenPersonnel || tokenPersonnel.role !== 'lead') {
        return res
          .status(403)
          .send({ message: 'Only a program lead can perform this action.' })
      }

      res.locals = { ...res.locals, tokenPersonnel }
      return next()
    } catch (e) {
      console.error(e)
      return res
        .status(403)
        .send({ message: 'Unable to verify permission for this action.' })
    }
  }
}

// Per-record program-ownership check for the by-id GET/PUT/DELETE routes
// that `isAuthorized()` can't cover (no :programId in the URL to compare —
// just the record's own id). Looks up the row's programId (directly, or via
// `resolveProgramId` for tables that only carry it indirectly) and 403s
// unless it's one of the caller's own programs. Must run after isAuthorized()
// (needs res.locals.personnelProgramIds).
export function requireProgramMatch(
  table: string,
  idParam: string,
  options: { resolveProgramId?: (id: string) => Promise<number | null> } = {},
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { personnelProgramIds } = res.locals
      const id = req.params[idParam]

      const programId = options.resolveProgramId
        ? await options.resolveProgramId(id)
        : (
            (await knex(table).select('programId').where('id', id).first()) as
              { programId: number | null } | undefined
          )?.programId

      if (programId === null || programId === undefined) {
        return res.status(404).send({ message: 'Resource not found.' })
      }

      if (!personnelProgramIds?.includes(programId)) {
        return res.status(403).send({
          message: 'Access to the requested resource is forbidden.',
        })
      }

      return next()
    } catch (e) {
      console.error(e)
      return res
        .status(403)
        .send({ message: 'Unable to verify access to this resource.' })
    }
  }
}
