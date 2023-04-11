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

export interface CatchRaw {}

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

export interface ReleaseCrew {
  id: number
  personnelId: number
  trapVisitId: number
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
