import { Client } from '@microsoft/microsoft-graph-client'
import axios from 'axios'

const getGraphAccessToken = async () => {
  try {
    const params = new URLSearchParams()
    params.append('client_id', process.env.CLIENT_ID || '')
    params.append('scope', 'https://graph.microsoft.com/.default')
    params.append('grant_type', 'client_credentials')
    params.append('client_secret', process.env.CLIENT_SECRET || '')
    const tokenResponse = await axios.post(
      'https://login.microsoftonline.com/rsttabletapp.onmicrosoft.com/oauth2/v2.0/token',
      params
    )

    return tokenResponse.data.access_token
  } catch (error) {
    console.error(error)
    throw error
  }
}

const getAuthenticatedClient = async () => {
  // Initialize Graph client
  const accessToken = await getGraphAccessToken()
  const client = Client.init({
    // Use the provided access token to authenticate requests
    authProvider: done => {
      done(null, accessToken)
    },
  })

  return client
}

export async function getAllGraphUsers(): Promise<any> {
  try {
    const graphClient = await getAuthenticatedClient()
    // Return the /me API endpoint result as a User object
    const graphResponse = await graphClient!
      .api('/users')
      .version('beta')
      // .select('displayName, b19488fadc674029a9b7fa92f675e6e2_Role')
      .get()

    return graphResponse.value
  } catch (error) {
    throw error
  }
}

export const getGraphUser = async userId => {
  try {
    const graphClient = await getAuthenticatedClient()
    const graphResponse = await graphClient!
      .api(`/users/${userId}`)
      .version('beta')
      .get()

    return graphResponse
  } catch (error) {
    throw error
  }
}
export const getCurrentUser = async (id: string) => {
  try {
    const graphClient = await getAuthenticatedClient()
    const graphResponse = await graphClient!
      .api(`/users/${id}`)
      .version('beta')
      .get()

    return graphResponse
  } catch (error) {
    throw error
  }
}
export const logOutUser = async (id: string) => {
  try {
    const graphClient = await getAuthenticatedClient()
    const graphResponse = await graphClient!
      .api(`/users/${id}/revokeSignInSessions`)
      .version('beta')
      .post('')

    return graphResponse
  } catch (error) {
    throw error
  }
}

export const patchUser = async (userId, requestBody) => {
  try {
    const graphClient = await getAuthenticatedClient()
    let res = await graphClient!
      .api(`/users/${userId}`)
      .version('beta')
      .patch(requestBody)
    const updatedUser = await graphClient!
      .api(`/users/${userId}`)
      .version('beta')
      .select(
        `displayName,surname,givenName,extension_${process.env.AZURE_EXTENSIONS_APP_CLIENT_ID}_Role`
      )
      .get()
    return updatedUser
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const postUser = async requestBody => {
  try {
    const graphClient = await getAuthenticatedClient()
    let res = await graphClient!.api('/users').post(requestBody)
    return res
  } catch (error) {
    console.error(error)
    throw error
  }
}
export const deleteUser = async azureId => {
  try {
    const graphClient = await getAuthenticatedClient()
    let res = await graphClient!.api(`/users/${azureId}`).delete()
    return res
  } catch (error) {
    console.error(error)
    throw error
  }
}
