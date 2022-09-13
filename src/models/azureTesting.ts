// Azure DB Connection Config
const config = {
  host: 'rstdb.postgres.database.azure.com',
  user: process.env.AZURE_USER,
  password: process.env.AZURE_PASSWORD,
  database: 'rstdb',
  port: 5432,
  ssl: true,
}

// Select Query
async function selectQuery(): Promise<string> {
  try {
    const payload = 'Wow! This was sent from the select query model!'
    return payload
  } catch (error) {
    throw error
  }
}

// Insert Query
async function insertQuery(): Promise<string> {
  try {
    const payload = 'Wow! This was sent from the insert query model!'
    return payload
  } catch (error) {
    throw error
  }
}

// Update Query
async function updateQuery(): Promise<string> {
  try {
    const payload = 'Wow! This was sent from the update query model!'
    return payload
  } catch (error) {
    throw error
  }
}

// Delete Query
async function deleteQuery(): Promise<string> {
  try {
    const payload = 'Wow! This was sent from the delete query model!'
    return payload
  } catch (error) {
    throw error
  }
}

export { selectQuery, insertQuery, updateQuery, deleteQuery }
