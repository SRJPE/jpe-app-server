export interface DropdownOption {
  id: number
  definition: string
  description?: string
  createdAt: Date
  updateddAt: Date
}

export interface TrapVisit {
  id: number
  project_id?: number
  subsite_id?: number
  visit_type?: number
  trap_visit_time_start?: Date
  trap_visit_time_end?: Date
  visit_datetime_stop?: Date
  fish_processed?: number
  equipment?: number
  trap_in_thalweg?: boolean
  trap_functioning?: number
  status_at_end?: number
  total_revolutions?: number
  rpm_at_start?: number
  rpm_at_stop?: number
  cone_depth?: number
  in_half_cone_configuration?: boolean
  debris_volume_liters?: number
  created_at?: Date
  updated_at?: Date
  qc_completed?: boolean
  qc_completed_at?: Date
  comments?: string
}
