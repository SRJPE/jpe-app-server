// get testing
async function getTesting(): Promise<string> {
  try {
    const payload = 'Wow! This was sent from the model!'
    return payload
  } catch (error) {
    throw error
  }
}

export { getTesting }
