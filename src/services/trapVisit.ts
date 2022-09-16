import { getTrapFunctionalities } from '../models/trapVisit/trapFunctionality'
import { getFishProcessedOptions } from '../models/trapVisit/fishProcessed'
import { getLifeStages } from '../models/trapVisit/lifeStage'
import { getMarkTypes } from '../models/trapVisit/markType'
import { getRuns } from '../models/trapVisit/run'
import { getMarkColors } from '../models/trapVisit/markColor'
import { getReleasePurposeOptions } from '../models/trapVisit/releasePurpose'

const getAllTrapVisitDropdowns = async () => {
  const dropdowns = {}
  const requestPromises = [
    getTrapFunctionalities(),
    getFishProcessedOptions(),
    getLifeStages(),
    getMarkTypes(),
    getMarkColors(),
    getRuns(),
    getReleasePurposeOptions(),
  ]
  const keys = [
    'trapFunctionality',
    'fishProcessed',
    'lifeStage',
    'markType',
    'markColor',
    'run',
    'releasePurpose',
  ]

  const requestsResult = await Promise.allSettled(requestPromises)

  requestsResult.forEach((result, index) => {
    dropdowns[keys[index]] = result.status == 'fulfilled' ? result.value : []
  })

  return dropdowns
}

export { getAllTrapVisitDropdowns }
