import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import { getPersonnelByAzureUid } from '../models/personnel'
import { getPersonnelPrograms } from '../models/program'

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
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
        }
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
    const tokenProgramIds = tokenPrograms.map(program => program.id)

    if (req.params.azureUid && req.params.azureUid !== azureUid) {
      console.log('Azure UID mismatch:', azureUid, req.params.azureUid)
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

    return next()
  }
}
