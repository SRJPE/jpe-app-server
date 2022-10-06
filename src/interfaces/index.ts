export interface DropdownOption {
  id: number
  definition: string
  description?: string
  createdAt: Date
  updateddAt: Date
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
}

export interface Program {
  id: number
  programName?: string
  streamName?: string
  personnelLead?: number
  funding_agency?: number
  efficiencyProtocolsDocumentLink?: string
  trappingProtocolsDocumentLink?: string
  createdAt?: Date
  updatedAt?: Date
}
