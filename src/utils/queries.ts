export const selectAllFromTableQuery = (tableName: string): string =>
  `SELECT * FROM ${tableName};`
