import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

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

export default {
  query: (text: string, params: any[]) => pool.query(text, params),
}
