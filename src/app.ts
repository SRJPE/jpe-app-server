import express, { RequestHandler } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import routes from './routes'
import 'isomorphic-fetch'
import passport from 'passport'
import { BearerStrategy } from 'passport-azure-ad'

export const azureConfig = {
  credentials: {
    tenantName: process.env.AZURE_TENANT_NAME,
    clientID: process.env.JPE_SERVER_API_CLIENT_ID,
    issuer: `https://${process.env.AZURE_TENANT_NAME}.b2clogin.com/${process.env.TENANT_ID}/v2.0/`,
  },
  policies: {
    policyName: 'B2C_1_signin',
  },
  resource: {
    scope: ['api.read', 'api.write'],
  },
  metadata: {
    discovery: '.well-known/openid-configuration',
    version: 'v2.0',
  },
  settings: {
    isB2C: true,
    validateIssuer: true,
    passReqToCallback: false,
    loggingLevel: 'error',
  },
}

// Set the Azure AD B2C options
const options = {
  identityMetadata: `https://${azureConfig.credentials.tenantName}.b2clogin.com/${azureConfig.credentials.tenantName}.onmicrosoft.com/${azureConfig.policies.policyName}/${azureConfig.metadata.version}/${azureConfig.metadata.discovery}`,
  clientID: azureConfig.credentials.clientID,
  audience: azureConfig.credentials.clientID,
  issuer: azureConfig.credentials.issuer,
  policyName: azureConfig.policies.policyName,
  isB2C: azureConfig.settings.isB2C,
  scope: azureConfig.resource.scope,
  validateIssuer: azureConfig.settings.validateIssuer,
  loggingLevel: azureConfig.settings.loggingLevel,
  passReqToCallback: azureConfig.settings.passReqToCallback,
}

// Instantiate the passport Azure AD library with the Azure AD B2C options
const bearerStrategy = new BearerStrategy(options, (token, done) => {
  // Send user info using the second argument
  done(null, {}, token)
})

dotenv.config()

const app = express()
app.use(passport.initialize())

passport.use(bearerStrategy)
const port = process.env.PORT || 8000

// Only the deployed dashboard origins need CORS — the mobile app isn't a
// browser, so it's never subject to CORS regardless of what's allowed here.
// ALLOWED_ORIGINS is a comma-separated list (see .env.* for the value each
// environment sets) rather than hardcoded, so this doesn't have to change
// (and this public repo doesn't have to list) the dashboard's exact deployed
// URL every time an environment is added, renamed, or moved.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

if (ALLOWED_ORIGINS.length === 0) {
  console.warn(
    'ALLOWED_ORIGINS is not set — no browser origin will be able to call this API.',
  )
}

app.use(cors({ origin: ALLOWED_ORIGINS }))
app.use(express.json({ limit: '50mb' }) as RequestHandler)
app.use(express.urlencoded({ limit: '50mb' }))
app.use('/', routes)

app.listen(port, (err?: Error) => {
  if (err) {
    return console.error(err)
  }
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
