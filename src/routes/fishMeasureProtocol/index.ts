import { Router } from 'express'
import {
  getFishMeasureProtocol,
  postFishMeasureProtocol,
  updateFishMeasureProtocol,
} from '../../models/fishMeasureProtocol'

const fishMeasureProtocolRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/fish-measure-protocol', fishMeasureProtocolRouter)

  // POST
  fishMeasureProtocolRouter.get('/:programId', async (req, res) => {
    try {
      const { programId } = req.params
      const fishMeasureProtocol = await getFishMeasureProtocol(programId)
      res.status(200).send(fishMeasureProtocol)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // POST
  fishMeasureProtocolRouter.post('/', async (req, res) => {
    try {
      const fishMeasureProtocolValues = req.body
      const createdFishMeasureProtocol = await postFishMeasureProtocol(
        fishMeasureProtocolValues
      )
      res.status(200).send(createdFishMeasureProtocol)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // PUT
  fishMeasureProtocolRouter.put('/:id', async (req, res) => {
    try {
      const { id } = req.params
      const fishMeasureProtocolValues = req.body
      const updatedFishMeasureProtocol = await updateFishMeasureProtocol({
        id,
        fishMeasureProtocolValues,
      })
      res.status(200).send(updatedFishMeasureProtocol)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
}
