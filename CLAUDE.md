# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev-start     # Start with nodemon (auto-reload)
npm run start         # Start with ts-node

# Build
npm run build         # Compile TypeScript to dist/

# Production
npm run prod-start    # Run compiled JS from dist/
```

There is no test runner script configured in package.json; check `src/tests/` for test files.

## Environment Variables

Requires an `.env` file with:
- `AZURE_HOST`, `AZURE_USER`, `AZURE_PASSWORD`, `AZURE_DB`, `AZURE_PORT`, `AZURE_SSL` — Azure PostgreSQL connection
- `PORT` — HTTP port (defaults to 8000)
- Azure AD B2C credentials for Passport authentication

Multiple environment files exist: `.env.local`, `.env.staging`, `.env.production`, `.env.production_datatackle`, `.env.ybfmp_staging`.

## Architecture

**Express + Knex/Objection.js backend API** connecting to Azure PostgreSQL. Domain is fisheries data (trap visits, fish catches, releases, personnel, permits, etc.).

### Request Flow

```
HTTP Request
  → CORS middleware
  → Passport Azure AD B2C Bearer token auth (isAuthenticated)
  → isAuthorized middleware (checks user program access, sets res.locals.azureUid)
  → Route handler (src/routes/<domain>/index.ts)
  → Model function (src/models/<domain>/<operation>.ts)
  → Knex/Objection query → Azure PostgreSQL
```

### Layer Responsibilities

- **`src/routes/`** — Express route definitions; thin handlers that call model functions and return results
- **`src/models/`** — Database queries using Knex/Objection; one file per operation (e.g., `getAll.ts`, `post.ts`, `put.ts`); subdomains split across many files (e.g., `trapVisit/` has 24+ files)
- **`src/services/`** — Business logic aggregating multiple model calls (e.g., `trapVisit.ts` assembles dropdown data from many tables)
- **`src/middleware/`** — Auth: `isAuthenticated` validates Bearer token; `isAuthorized` checks program-level access
- **`src/interfaces/`** — TypeScript interfaces for domain models
- **`src/db/`** — Knex connection setup with Azure PostgreSQL, snake_case column mapping, UTC timestamp parsing

### Database Conventions

- Knex with Objection.js ORM; snake_case DB columns mapped to camelCase in JS via `knex-stringcase`
- Custom timestamp parser ensures UTC for all date fields
- Pool: min 2, max 10 connections
- Migrations and seeds are in their respective directories (configured in `knexfile.js`)

### Authentication

Azure AD B2C via `passport-azure-ad` Bearer strategy. `azureUid` is extracted from the token and stored in `res.locals` for use in route handlers to identify the calling user.
