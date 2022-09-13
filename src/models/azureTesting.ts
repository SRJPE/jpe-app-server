import db from '../db'
import { selectAllFromTableQuery } from '../utils/queries'

// Select Query
async function selectAllFromTable(tableName: string): Promise<any> {
  try {
    const query = selectAllFromTableQuery(tableName)
    const { rows } = await db.query(query, [])
    const payload = {
      message: 'Wow! This was sent from the select query model!',
      values: rows,
    }
    return payload
  } catch (error) {
    console.log(error)
    throw error
  }
}

// Insert Query
async function insertIntoTable(): Promise<any> {
  try {
    const payload = 'Wow! This was sent from the insert query model!'
    return payload
  } catch (error) {
    throw error
  }
}

// Update Query
async function updateTable(): Promise<any> {
  try {
    const payload = 'Wow! This was sent from the update query model!'
    return payload
  } catch (error) {
    throw error
  }
}

// Delete Query
async function deleteFromTable(): Promise<any> {
  try {
    const payload = 'Wow! This was sent from the delete query model!'
    return payload
  } catch (error) {
    throw error
  }
}

export { selectAllFromTable, insertIntoTable, updateTable, deleteFromTable }
