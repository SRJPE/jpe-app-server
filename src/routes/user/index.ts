import { Router } from 'express'
import { DeviceCodeCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'
import {
  getAllGraphUsers,
  getCurrentUser,
  logOutUser,
  changeUserPassword,
  patchUser,
  createNewUser,
} from '../../services/microsoftGraph'
import * as jwt from 'jsonwebtoken'

const userRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/user', userRouter)

  // @azure/identity
  const credential = new DeviceCodeCredential({
    tenantId: process.env.TENANT_ID,
    clientId: process.env.CLIENT_ID,
    userPromptCallback: info => {
      console.log(info.message)
    },
  })

  // @microsoft/microsoft-graph-client/authProviders/azureTokenCredentials
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['User.Read'],
  })

  const graphClient = Client.initWithMiddleware({ authProvider: authProvider })

  userRouter.get('/', async (req, res) => {
    const test = await getAllGraphUsers()
    try {
      res.status(200).send(test)
    } catch (error) {
      console.error(error)
      res.status(400).send({ error, label: 'Baddd' })
    }
  })

  userRouter.get('/current', async (req, res) => {
    const idToken = req.headers.idtoken
    const accessToken = req.headers.accesstoken

    const decodedToken = jwt.decode(idToken, { complete: true })
    const userId = decodedToken.payload.sub

    const user = await getCurrentUser(userId)

    const userEmailIdentity = user.identities.find(
      identity => identity.signInType === 'emailAddress'
    )
    try {
      res.status(200).send({
        displayName: user.displayName,
        firstName: user.givenName,
        lastName: user.surname,
        azureUid: user.id,
        emailAddress: userEmailIdentity.issuerAssignedId,
      })
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  userRouter.patch('/:azureUid/edit', async (req, res) => {
    const userId = req.params.azureUid

    try {
      const patchUserRes = await patchUser(userId, req.body)

      res.status(200).send(patchUserRes)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
  userRouter.post('/:azureUid/logout', async (req, res) => {
    const userId = req.params.azureUid

    try {
      const logOutRes = await logOutUser(userId)
      console.log('🚀 ~ userRouter.post ~ logOutRes:', logOutRes)

      res.status(200).send(logOutRes)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  userRouter.post('/create', async (req, res) => {
    const requestBody = req.body

    try {
      const createNewUserRes = await createNewUser(requestBody)

      res.status(200).send(createNewUserRes)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  userRouter.post('/:azureUid/change-password', async (req, res) => {
    const userId = req.params.azureUid
    const credentialsObj = req.body

    try {
      const changeUserPasswordRes = await changeUserPassword(
        userId,
        credentialsObj
      )
      console.log(
        '🚀 ~ userRouter.post ~ changeUserPasswordRes:',
        changeUserPasswordRes
      )

      res.status(200).send(changeUserPasswordRes)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
  // GET /user/
}
