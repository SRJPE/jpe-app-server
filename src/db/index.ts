import { Pool, types } from 'pg'
import dotenv from 'dotenv'
dotenv.config()
import Knex from 'knex'
import knexConfig from '../../knexfile.js'

types.setTypeParser(1114, function (stringValue) {
  return new Date(stringValue + 'Z').toISOString() // Ensure UTC and append "Z"
})

// Azure DB Connection Config
const config = {
  host: process.env.AZURE_HOST,
  user: process.env.AZURE_USER,
  password: process.env.AZURE_PASSWORD,
  database: process.env.AZURE_DB,
  port: parseInt(process.env.AZURE_PORT, 10) || 5432,
  ssl: process.env.AZURE_SSL === 'TRUE',
}

const pool = new Pool(config)

const knex = Knex(knexConfig)

export default {
  query: (text: string, params: any[]) => pool.query(text, params),
  knex,
}
