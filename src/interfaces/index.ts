export interface DropdownOption {
  id: number
  definition: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface TrapVisit {
  id: number
  projectId?: number
  visitType?: number
  trapVisitTimeStart?: Date
  trapVisitTimeEnd?: Date
  fishProcessed?: number
  equipment?: number
  trapInThalweg?: boolean
  trapFunctioning?: number
  statusAtEnd?: number
  totalRevolutions?: number
  rpmAtStart?: number
  rpmAtStop?: number
  coneDepth?: number
  inHalfConeConfiguration?: boolean
  debrisVolumeLiters?: number
  createdAt?: Date
  updatedAt?: Date
  qcCompleted?: boolean
  qcCompletedAt?: Date
  comments?: string
  crew?: Array<any>
  environmental?: Record<string, any>
}

export interface TrapVisitCrew {
  id: number
  personnelId: number
  trapVisitId: number
}

export interface Program {
  id: number
  programName?: string
  streamName?: string
  personnelLead?: number
  fundingAgency?: number
  efficiencyProtocolsDocumentLink?: string
  trappingProtocolsDocumentLink?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Personnel {
  id: number
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  agencyId?: number
  role?: string
  orcidId?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ProgramPersonnelTeam {
  id: number
  personnelId: number
  programId: number
}

export interface CatchRaw {}

export interface ExistingMarksI {
  id: number
  programId: number
  releaseId: number
  markAppliedId: number
  catchRawId: number
  fishId: string
  markTypeId: number
  markPositionId: number
  markColorId: number
  markCode: string
  createdAt: Date
  updatedAt: Date
}
export interface GeneticSamplingDataI {
  id: number
  catchRawId: number
  sampleId: string
  sampleBin?: string
  mucusSwab: boolean
  finClip: boolean
  comments?: string
}
export interface GeneticSamplingCrewI {
  id: number
  personnelId: number
  geneticSamplingDataId: number
}
export interface MarkAppliedI {
  id: number
  catchRawId: number
  programId: number
  markTypeId: number
  markPositionId: number
  markColorId?: number
  markCode?: number
  comments?: string
  createdAt: Date
  updatedAt: Date
}
export interface MarkAppliedCrewI {
  id: number
  personnel: number
  markAppliedId: number
}

export interface CatchFishConditionI {
  id: number
  catchRawId: number
  fishConditionId: string
}

export interface Release {
  id: number
  programId: number
  releasePurposeId?: number
  releaseSiteId?: number
  releasedAt?: Date
  markedAt?: Date
  markColor?: number
  markType?: number
  markPosition?: number
  runHatcheryFish?: number
  hatcheryFishWeight?: number
  totalWildFishReleased?: number
  totalHatcheryFishReleased?: number
  totalWildFishDead?: number
  totalHatcheryFishDead?: number
  crew?: Array<any>
}

export interface ReleaseMarks {
  id: number
  releaseId: number
  markType: number
  markColor: number
  bodyPart: number
}
export interface ReleaseCrew {
  id: number
  releaseId: number
  personnelId: number
}

export interface ReleaseSite {
  id: number
  trapLocationsId: number
  releaseSiteName: string
  releaseSiteXCoord: number
  releaseSiteYCoord: number
  releaseSiteCoordinateSystem: string
  releaseSiteDatum: string
  releaseSiteProjection: string
}

export interface TrapLocations {
  id: number
  trapName?: string
  programId?: number
  dataRecorderId?: number
  dataRecorderAgencyId?: number
  siteName?: string
  coneSizeFt?: number
  xCoord?: number
  yCoord?: number
  coordinateSystem?: any
  projection?: string
  datum?: string
  gageNumber?: number
  gageAgency?: number
  comments?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface TrapCoordinates {
  id: number
  trapVisitId: number
  trapLocationsId: number
  xCoord: number
  yCoord: number
  datum: string
  projection: string
}

export interface TrapVisitEnvironmental {
  id: number
  trapVisitId: number
  measureName: string
  measureValueNumeric: number
  measureValueText: string
  measureUnit: number
}

export interface HatcheryInfo {
  id: number
  hatcheryName?: string
  streamName?: string
  agreementId?: string
  programId?: number
  agreementStartDate?: Date
  agreementEndDate?: Date
  renewalDate?: Date
  frequencyOfFishCollection?: number
  quantityOfFish?: number
  hatcheryFileLink?: string
}

export interface FishMeasureProtocol {
  id: number
  programId?: number
  species?: string
  lifeStage?: number
  run?: number
  numberMeasured?: number
}

export interface PermitInfo {
  id: number
  permitId?: string
  programId?: number
  streamName?: string
  permitStartDate?: Date
  permitEndDate?: Date
  flowThreshold?: number
  temperatureThreshold?: number
  frequencySamplingInclementWeather?: number
  species?: string
  listingUnit?: number
  fishLifeStage?: string
  allowedExpectedTake?: number
  allowedMortalityCount?: number
  permitFileLink?: string
}
export interface TakeAndMortality {
  id: number
  permit_info_id: number
  species: string
  listing_unit: number
  fish_life_stage: number
  allowed_expected_take: number
  allowed_mortality_count: number
  comments: string
}
