import { Knex } from 'knex'

/**
 * Thrown when a PUT carried `expectedUpdatedAt` but the row has changed
 * since the client loaded it. Routes map this to 409 so the client can
 * reload instead of silently overwriting someone else's edit.
 */
export class StaleWriteError extends Error {
  current: Record<string, any>

  constructor(current: Record<string, any>) {
    super('This record was changed by someone else since it was loaded.')
    this.name = 'StaleWriteError'
    this.current = current
  }
}

/**
 * Removes and returns the optimistic-concurrency token from a request body
 * section, so it is never written as a column. `undefined` means the client
 * didn't send one (older clients, the tablet app) — no check is done.
 */
export function takeExpectedUpdatedAt(
  data: Record<string, any> | undefined
): string | null | undefined {
  if (!data || !('expectedUpdatedAt' in data)) return undefined
  const value = data.expectedUpdatedAt
  delete data.expectedUpdatedAt
  return value ?? null
}

/**
 * `UPDATE table SET ...data, updatedAt = now() WHERE id = :id`, and — when
 * `expectedUpdatedAt` is given — only if the row's updatedAt still matches.
 *
 * Compared at millisecond precision: Postgres keeps microseconds but the
 * value the client echoes back went through a JS Date. The bound value is a
 * Date so node-pg serializes it the same way it parsed the column, for both
 * timestamp and timestamptz columns.
 *
 * Always bumps updatedAt, so the next stale check sees this write.
 */
export async function versionedUpdate(
  db: Knex | Knex.Transaction,
  table: string,
  id: string | number,
  data: Record<string, any>,
  expectedUpdatedAt?: string | null
): Promise<any[]> {
  const query = db(table).where('id', id)
  if (expectedUpdatedAt === null) {
    query.whereNull('updatedAt')
  } else if (expectedUpdatedAt !== undefined) {
    query.whereRaw("date_trunc('milliseconds', ??) = date_trunc('milliseconds', ?)", [
      'updatedAt',
      new Date(expectedUpdatedAt),
    ])
  }

  const updated = await query.update({ ...data, updatedAt: db.fn.now() }, ['*'])

  if (updated.length === 0 && expectedUpdatedAt !== undefined) {
    const current = await db(table).where('id', id).first()
    if (current) throw new StaleWriteError(current)
  }
  return updated
}

/**
 * Route helper: answers 409 for a StaleWriteError and returns true, so the
 * caller can `if (sendStaleWrite(res, error)) return` before its generic
 * error handling.
 */
export function sendStaleWrite(
  res: { status: (code: number) => { send: (body: any) => any } },
  error: unknown
): boolean {
  if (!(error instanceof StaleWriteError)) return false
  res.status(409).send({
    error: 'stale',
    message: error.message,
    current: error.current,
  })
  return true
}
