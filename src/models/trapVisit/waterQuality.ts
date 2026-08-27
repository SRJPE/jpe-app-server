import db from '../../db'
import { CodeDropdownOption } from '../../interfaces'

const { knex } = db

async function getConditionCodeOptions(): Promise<Array<CodeDropdownOption>> {
  try {
    const conditionCodeRecords = await knex<CodeDropdownOption>(
      'conditionCode'
    ).select('*')
    return conditionCodeRecords
  } catch (error) {
    throw error
  }
}

async function getVegetationCodeOptions(): Promise<Array<CodeDropdownOption>> {
  try {
    const vegetationCodeRecords = await knex<CodeDropdownOption>(
      'vegetationCode'
    ).select('*')
    return vegetationCodeRecords
  } catch (error) {
    throw error
  }
}

async function getTideCodeOptions(): Promise<Array<CodeDropdownOption>> {
  try {
    const tideCodeRecords = await knex<CodeDropdownOption>('tideCode').select(
      '*'
    )
    return tideCodeRecords
  } catch (error) {
    throw error
  }
}

async function getFlowDirectionOptions(): Promise<Array<CodeDropdownOption>> {
  try {
    const flowDirectionRecords = await knex<CodeDropdownOption>(
      'flowDirection'
    ).select('*')
    return flowDirectionRecords
  } catch (error) {
    throw error
  }
}

async function getWeatherCodeOptions(): Promise<Array<CodeDropdownOption>> {
  try {
    const weatherCodeRecords = await knex<CodeDropdownOption>(
      'weatherCode'
    ).select('*')
    return weatherCodeRecords
  } catch (error) {
    throw error
  }
}

// substrate is now program-scoped (see models/program/substrateOptions.ts,
// used by the dashboard's Manage Options UI) — programId/active columns
// were added there. This function is the one the mobile app's general
// dropdowns endpoint actually reads (getAllTrapVisitDropdowns), and it has
// no program context to scope by, so it's deliberately narrowed to just the
// shared defaults (programId IS NULL, active) rather than every row —
// otherwise a program's private additions or hidden defaults would leak to
// (or fail to disappear from) every OTHER program's mobile dropdown. A
// program's own customizations don't reach mobile yet; that needs this
// entry to become program-scoped the same way programTaxonAbbreviation
// already is, which also requires a corresponding rst-pilot-app-client
// change to consume a per-program shape instead of one flat list.
async function getSubstrateOptions(): Promise<Array<CodeDropdownOption>> {
  try {
    const substrateRecords = await knex<CodeDropdownOption>('substrate')
      .whereNull('programId')
      .andWhere('active', true)
      .select('*')
    return substrateRecords
  } catch (error) {
    throw error
  }
}

async function getGearStatusOptions(): Promise<Array<CodeDropdownOption>> {
  try {
    const gearStatusRecords = await knex<CodeDropdownOption>(
      'gearStatus'
    ).select('*')
    return gearStatusRecords
  } catch (error) {
    throw error
  }
}

async function getYsiNumOptions(): Promise<Array<CodeDropdownOption>> {
  try {
    const ysiNumRecords = await knex<CodeDropdownOption>('ysiNum').select('*')
    return ysiNumRecords
  } catch (error) {
    throw error
  }
}

export {
  getConditionCodeOptions,
  getVegetationCodeOptions,
  getTideCodeOptions,
  getFlowDirectionOptions,
  getWeatherCodeOptions,
  getSubstrateOptions,
  getGearStatusOptions,
  getYsiNumOptions,
}
