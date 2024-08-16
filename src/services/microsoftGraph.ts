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
    const currentUserResponse = await graphClient!
      .api(`/users/${id}`)
      .version('beta')
      .get()

    return { ...currentUserResponse }
  } catch (error) {
    console.error('🚀 ~ getCurrentUser ~ error:', error)
    throw error
  }
}
export const changeUserPassword = async (
  id: string,
  credentialsObj: { currentPassword: string; newPassword: string }
) => {
  try {
    const graphClient = await getAuthenticatedClient()
    const graphResponse = await graphClient!
      .api(`/users/${id}/changePassword`)
      .version('beta')
      .post(credentialsObj)

    return graphResponse
  } catch (error) {
    console.error('🚀 ~ error:', error)
    throw error
  }
}
export const logOutUser = async (id: string) => {
  try {
    const graphClient = await getAuthenticatedClient()
    const graphResponse = await graphClient!
      .api(`/users/${id}/revokeSignInSessions`)
      .version('beta')
      .post(null)

    return graphResponse
  } catch (error) {
    throw error
  }
}
export const createNewUser = async requestBody => {
  const transformedRequestBody = {
    givenName: requestBody.firstName,
    surname: requestBody.lastName,
    department: requestBody.department,
    jobTitle: requestBody.jobTitle,
    displayName: `${requestBody.firstName} ${requestBody.lastName}`,
    accountEnabled: true,
    mailNickname: requestBody.emailAddress.split('@')[0],
    // mail: requestBody.emailAddress,
    passwordProfile: {
      forceChangePasswordNextSignIn: true,
      password: 'FishFood123!',
    },
    passwordPolicies: 'DisablePasswordExpiration',
    identities: [
      {
        signInType: 'emailAddress',
        issuer: process.env.AZURE_TENANT_DOMAIN_NAME,
        issuerAssignedId: requestBody.emailAddress,
      },
    ],
  }

  try {
    const graphClient = await getAuthenticatedClient()
    const graphResponse = await graphClient!
      .api(`/users`)
      .version('beta')
      .post(transformedRequestBody)

    return graphResponse
  } catch (error) {
    throw error
  }
}

export const patchUser = async (userId, requestBody) => {
  const transformedRequestBody = {
    givenName: requestBody.firstName,
    surname: requestBody.lastName,
    department: requestBody.department,
    jobTitle: requestBody.jobTitle,
    displayName: `${requestBody.firstName} ${requestBody.lastName}`,
  }

  try {
    const graphClient = await getAuthenticatedClient()
    let res = await graphClient!
      .api(`/users/${userId}`)
      .version('beta')
      .patch(transformedRequestBody)
  } catch (error) {
    console.error('🚀 ~ patchUser ~ error:', error)
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
