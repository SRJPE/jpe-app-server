const { join } = require('path')
require('dotenv').config({ path: join(__dirname, '.env') })
const { knexSnakeCaseMappers } = require('objection')

module.exports = {
  client: 'pg',
  connection: {
    host: process.env.AZURE_HOST,
    user: process.env.AZURE_USER,
    password: process.env.AZURE_PASSWORD,
    database: process.env.AZURE_DB,
    port: parseInt(process.env.AZURE_PORT, 10) || 5432,
    ssl: process.env.AZURE_SSL === 'TRUE',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: join(__dirname, '/knex/migrations'),
  },
  seeds: {
    directory: join(__dirname, '/knex/seeds'),
  },
  ...knexSnakeCaseMappers(),
}
