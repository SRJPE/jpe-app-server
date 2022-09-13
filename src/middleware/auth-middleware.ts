import { Request, Response, NextFunction } from 'express'

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    return next()
  } catch (error) {
    console.log(error)
    return res.status(401).send({ message: 'Token provided is not authenticated' })
  }
}

export function isAuthorized() {
  return (req: Request, res: Response, next: Function) => {
    try {
      return next()
    } catch (error) {
      console.log(error)
      return res.status(401).send({ message: 'Token provided is not authorized' })
    }
  }
}
