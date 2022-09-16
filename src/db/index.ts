import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()
import Knex from 'knex'
import knexConfig from '../../knexfile.js'

// Azure DB Connection Config
const config = {
  host: process.env.AZURE_HOST,
  user: process.env.AZURE_USER,
  password: process.env.AZURE_PASSWORD,
  database: process.env.AZURE_DB,
  port: 5432,
  ssl: true,
}

const pool = new Pool(config)

const knex = Knex(knexConfig)

export default {
  query: (text: string, params: any[]) => pool.query(text, params),
  knex,
}
