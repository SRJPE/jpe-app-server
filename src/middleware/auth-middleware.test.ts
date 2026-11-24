import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'

const mockGetPersonnelByAzureUid = vi.fn()
const mockGetPersonnelPrograms = vi.fn()

vi.mock('../models/personnel', () => ({
  getPersonnelByAzureUid: (...args: any[]) =>
    mockGetPersonnelByAzureUid(...args),
}))
vi.mock('../models/program', () => ({
  getPersonnelPrograms: (...args: any[]) => mockGetPersonnelPrograms(...args),
}))

// Chainable knex mock: knex(table).select(...).where(...).first() resolves
// to whatever `firstResult` currently holds.
let firstResult: any
const knexChain: any = {
  select: vi.fn(() => knexChain),
  where: vi.fn(() => knexChain),
  join: vi.fn(() => knexChain),
  first: vi.fn(() => Promise.resolve(firstResult)),
}
const knexMock = vi.fn((..._args: any[]) => knexChain)
vi.mock('../db', () => ({
  default: { knex: (...args: any[]) => knexMock(...args) },
}))

import {
  isAuthorized,
  requireLead,
  requireProgramMatch,
} from './auth-middleware'

function makeReqResNext(
  params: Record<string, string> = {},
  locals: Record<string, any> = {},
) {
  const req = { params } as unknown as Request
  const res = {
    locals,
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as Response & { status: any; send: any }
  const next = vi.fn()
  return { req, res, next }
}

beforeEach(() => {
  vi.clearAllMocks()
  firstResult = undefined
})

describe('isAuthorized', () => {
  const personnel = { id: 7, email: 'ada@example.com' }
  const programs = [{ id: 1 }, { id: 2 }]

  beforeEach(() => {
    mockGetPersonnelByAzureUid.mockResolvedValue(personnel)
    mockGetPersonnelPrograms.mockResolvedValue(programs)
  })

  it('allows a request with no azureUid/personnelId/programId params', async () => {
    const { req, res, next } = makeReqResNext({}, { azureUid: 'uid-7' })
    await isAuthorized()(req, res, next)
    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
    expect(res.locals.personnelProgramIds).toEqual([1, 2])
  })

  it('allows a request whose :azureUid matches the caller', async () => {
    const { req, res, next } = makeReqResNext(
      { azureUid: 'uid-7' },
      { azureUid: 'uid-7' },
    )
    await isAuthorized()(req, res, next)
    expect(next).toHaveBeenCalledOnce()
  })

  it("rejects a request whose :azureUid is someone else's", async () => {
    const { req, res, next } = makeReqResNext(
      { azureUid: 'someone-elses-uid' },
      { azureUid: 'uid-7' },
    )
    await isAuthorized()(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it("rejects a request whose :personnelId is someone else's", async () => {
    const { req, res, next } = makeReqResNext(
      { personnelId: '999' },
      { azureUid: 'uid-7' },
    )
    await isAuthorized()(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it("allows a request whose :programId is one of the caller's own programs", async () => {
    const { req, res, next } = makeReqResNext(
      { programId: '2' },
      { azureUid: 'uid-7' },
    )
    await isAuthorized()(req, res, next)
    expect(next).toHaveBeenCalledOnce()
  })

  it("rejects a request whose :programId is not one of the caller's programs", async () => {
    const { req, res, next } = makeReqResNext(
      { programId: '999' },
      { azureUid: 'uid-7' },
    )
    await isAuthorized()(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })
})

describe('requireLead', () => {
  it('allows a caller whose personnel role is lead', async () => {
    mockGetPersonnelByAzureUid.mockResolvedValue({ id: 1, role: 'lead' })
    const { req, res, next } = makeReqResNext({}, { azureUid: 'uid-lead' })
    await requireLead()(req, res, next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('rejects a caller whose personnel role is non-lead', async () => {
    mockGetPersonnelByAzureUid.mockResolvedValue({ id: 2, role: 'non-lead' })
    const { req, res, next } = makeReqResNext({}, { azureUid: 'uid-tech' })
    await requireLead()(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('rejects when there is no personnel record for this azureUid', async () => {
    mockGetPersonnelByAzureUid.mockResolvedValue(undefined)
    const { req, res, next } = makeReqResNext({}, { azureUid: 'uid-unknown' })
    await requireLead()(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('reuses res.locals.tokenPersonnel set by a prior isAuthorized() call without re-querying', async () => {
    const { req, res, next } = makeReqResNext(
      {},
      { azureUid: 'uid-lead', tokenPersonnel: { id: 1, role: 'lead' } },
    )
    await requireLead()(req, res, next)
    expect(mockGetPersonnelByAzureUid).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledOnce()
  })
})

describe('requireProgramMatch', () => {
  it("allows access when the record's programId is one of the caller's own", async () => {
    firstResult = { programId: 2 }
    const { req, res, next } = makeReqResNext(
      { trapVisitId: '55' },
      { personnelProgramIds: [1, 2, 3] },
    )
    await requireProgramMatch('trapVisit', 'trapVisitId')(req, res, next)
    expect(next).toHaveBeenCalledOnce()
    expect(knexMock).toHaveBeenCalledWith('trapVisit')
  })

  it('rejects access when the record belongs to a different program', async () => {
    firstResult = { programId: 99 }
    const { req, res, next } = makeReqResNext(
      { trapVisitId: '55' },
      { personnelProgramIds: [1, 2, 3] },
    )
    await requireProgramMatch('trapVisit', 'trapVisitId')(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('returns 404 when the record does not exist', async () => {
    firstResult = undefined
    const { req, res, next } = makeReqResNext(
      { trapVisitId: '404' },
      { personnelProgramIds: [1, 2, 3] },
    )
    await requireProgramMatch('trapVisit', 'trapVisitId')(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('uses a custom resolveProgramId when the table has no direct programId column', async () => {
    const resolveProgramId = vi.fn().mockResolvedValue(2)
    const { req, res, next } = makeReqResNext(
      { geneticSamplingId: '10' },
      { personnelProgramIds: [2] },
    )
    await requireProgramMatch('geneticSamplingData', 'geneticSamplingId', {
      resolveProgramId,
    })(req, res, next)
    expect(resolveProgramId).toHaveBeenCalledWith('10')
    expect(next).toHaveBeenCalledOnce()
  })

  it('fails closed (403) if the lookup throws', async () => {
    const resolveProgramId = vi.fn().mockRejectedValue(new Error('db down'))
    const { req, res, next } = makeReqResNext(
      { geneticSamplingId: '10' },
      { personnelProgramIds: [2] },
    )
    await requireProgramMatch('geneticSamplingData', 'geneticSamplingId', {
      resolveProgramId,
    })(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })
})
