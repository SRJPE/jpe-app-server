import { getTrapFunctionalities } from '../models/trapVisit/trapFunctionality'
import { getFishProcessedOptions } from '../models/trapVisit/fishProcessed'
import { getLifeStages } from '../models/trapVisit/lifeStage'
import { getMarkTypes } from '../models/trapVisit/markType'
import { getRuns } from '../models/trapVisit/run'
import { getMarkColors } from '../models/trapVisit/markColor'
import { getConeDebrisVolumeOptions } from '../models/trapVisit/coneDebrisVolume'
import { getReleasePurposeOptions } from '../models/trapVisit/releasePurpose'
import { getVisitTypes } from '../models/trapVisit/visitType'

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
    getConeDebrisVolumeOptions(),
    getVisitTypes(),
  ]
  const keys = [
    'trapFunctionality',
    'fishProcessed',
    'lifeStage',
    'markType',
    'markColor',
    'run',
    'releasePurpose',
    'coneDebrisVolume',
    'visitType',
  ]

  const requestsResult = await Promise.allSettled(requestPromises)

  requestsResult.forEach((result, index) => {
    dropdowns[keys[index]] = result.status == 'fulfilled' ? result.value : []
  })

  return dropdowns
}

export { getAllTrapVisitDropdowns }
