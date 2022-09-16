import { getTrapFunctionalities } from '../models/trapVisit/trapFunctionality'
import { getFishProcessedOptions } from '../models/trapVisit/fishProcessed'
import fishProcessed from '../routes/trapVisit/fishProcessed'

const getAllTrapVisitDropdowns = async () => {
  const dropdowns = {}
  const requestPromises = [getTrapFunctionalities(), getFishProcessedOptions()]
  const keys = ['trapFunctionality', 'fishProcessed']

  const requestsResult = await Promise.allSettled(requestPromises)

  requestsResult.forEach((result, index) => {
    dropdowns[keys[index]] = result.status == 'fulfilled' ? result.value : []
  })

  return dropdowns
}

export { getAllTrapVisitDropdowns }
