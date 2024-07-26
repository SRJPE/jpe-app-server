import { Request, Response, NextFunction } from 'express'
import passport from 'passport'

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
          if (err || !payload) {
            console.error(err)
            return res
              .status(401)
              .send({ message: 'Token provided is not valid' })
          }

          // res.locals = {
          //   ...res.locals,
          //   role: info['extension_Role'] || 'user',
          //   email: info.emails[0],
          //   uid: info.sub,
          //   name: `${info.given_name} ${info.family_name}`,
          // }
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
// export function isAuthorized(options: {
//   hasRole?: any
//   allowSameUser?: boolean
// }) {
//   return (req: Request, res: Response, next: Function) => {
//     const { role, email, uid } = res.locals

//     const { azureUid } = req.params
//     if (options.allowSameUser && azureUid === uid) return next()

//     if (!role) return res.status(403).send()

//     if (options.hasRole.includes(role)) return next()

//     return res
//       .status(403)
//       .send(`Access to the requested resource is forbidden for ${email}`)
//   }
// }
