import { getTrapFunctionalities } from '../models/trapFunctionality'

const getAllTrapVisitDropdowns = async () => {
  const dropdowns = {}
  const requestPromises = [getTrapFunctionalities()]
  const keys = ['trapFunctionality']

  const requestsResult = await Promise.allSettled(requestPromises)

  requestsResult.forEach((result, index) => {
    dropdowns[keys[index]] = result.status == 'fulfilled' ? result.value : []
  })

  return dropdowns
}

export { getAllTrapVisitDropdowns }
