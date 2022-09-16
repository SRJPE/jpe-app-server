import { Router } from 'express'
import { getConeDebrisVolumeOptions } from '../../models/trapVisit/coneDebrisVolume'

const coneDebrisVolumeRouter = Router()

export default (trapVisitRouter: Router) => {
  trapVisitRouter.use('/cone-debris-volume', coneDebrisVolumeRouter)

  //GET
  coneDebrisVolumeRouter.get('/', async (req, res) => {
    try {
      const result = await getConeDebrisVolumeOptions()
      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
