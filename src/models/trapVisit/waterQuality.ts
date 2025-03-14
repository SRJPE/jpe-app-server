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

async function getSubstrateOptions(): Promise<Array<CodeDropdownOption>> {
  try {
    const substrateRecords = await knex<CodeDropdownOption>('substrate').select(
      '*'
    )
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
