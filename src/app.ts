import express, { RequestHandler } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import routes from './routes'

dotenv.config()

const app = express()
const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json({ limit: '50mb' }) as RequestHandler)
app.use(express.urlencoded({ limit: '50mb' }))
app.use('/', routes)

app.listen(port, (err?: Error) => {
  if (err) {
    return console.error(err)
  }
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
