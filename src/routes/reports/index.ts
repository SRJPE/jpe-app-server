import { Router } from 'express'
import { getBiWeeklyPassageSummary } from '../../models/reports'
import { prepareBiWeeklyReportEmailForSend } from '../../services/mailer'
const reportsRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/reports', reportsRouter)

  //GET bi-weekly passage summary report
  reportsRouter.get('/bi-weekly-passage-summary/:id', async (req, res) => {
    try {
      const { id } = req.params
      const biweeklyPassageSummaryReport = await getBiWeeklyPassageSummary(id)

      res.status(200).send(biweeklyPassageSummaryReport)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })
  //Send bi-weekly passage summary report
  reportsRouter.post('/bi-weekly-passage-summary/:id', async (req, res) => {
    try {
      const { id } = req.params
      const { name, email, frequency } = req.body.values
      const { senderName, senderEmail } = req.body.sender

      const biweeklyPassageSummaryReport = await getBiWeeklyPassageSummary(id)

      const biweeklyPassageSummaryReportEmailResponse =
        await prepareBiWeeklyReportEmailForSend({
          to: { recipientEmail: email, recipientName: name },
          from: { senderName, senderEmail },
          isScheduled: frequency || false,
          reportContent: biweeklyPassageSummaryReport,
        })

      res.status(200).send(biweeklyPassageSummaryReportEmailResponse)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  // reportsRouter.post('/email', async (req, res) => {
  //   try {
  //     console.log(
  //       '🚀 ~ reportsRouter.post ~ body:',
  //       req.body ? req.body : 'no body'
  //     )

  //     const { to, subject, filePath, isScheduled } = req.body
  //     // const biweeklyPassageSummaryReportEmailResponse = await testFunc()
  //     const biweeklyPassageSummaryReportEmailResponse =
  //       await prepareBiWeeklyReportEmailForSend({
  //         to,
  //         subject,
  //         filePath,
  //         isScheduled,
  //       })

  //     //need to create a flag to say it should be automated

  //     res.status(200).send(biweeklyPassageSummaryReportEmailResponse)
  //   } catch (error) {
  //     console.error(error)
  //     res.status(400).send(error)
  //   }
  // })
}
