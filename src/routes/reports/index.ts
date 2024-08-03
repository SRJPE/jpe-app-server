import { Router } from 'express'
import * as nodemailer from 'nodemailer'
import * as fs from 'fs'
import * as path from 'path'

import { getBiWeeklyPassageSummary } from '../../models/reports'
const reportRouter = Router({ mergeParams: true })

export default (mainRouter: Router) => {
  mainRouter.use('/report', reportRouter)

  //GET bi-weekly passage summary report
  reportRouter.get('/biweeklyPassageSummary/:id', async (req, res) => {
    try {
      const { id } = req.params
      const biweeklyPassageSummaryReport = await getBiWeeklyPassageSummary(id)
      res.status(200).send(biweeklyPassageSummaryReport)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  })

  reportRouter.post('/send-email', async (req, res) => {
    const { to, subject, filePath } = req.body

    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service
      auth: {
        user: 'your-email@gmail.com', // Your email
        pass: 'your-email-password', // Your email password
      },
    })
    let transporterTEST = {
      service: 'gmail', // Use your email service
      auth: {
        user: 'your-email@gmail.com', // Your email
        pass: 'your-email-password', // Your email password
      },
    }

    // Read the file content
    const fileContent = fs.readFileSync(path.resolve(__dirname, filePath))

    // Set up email data
    let mailOptions = {
      from: '"Document Viewer" <your-email@gmail.com>', // Sender address
      to: to, // List of receivers
      subject: subject, // Subject line
      text: 'Please find the attached document.', // Plain text body
      attachments: [
        {
          filename: path.basename(filePath),
          content: fileContent,
        },
      ],
    }

    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send(error.toString())
      }
      res.status(200).send('Email sent: ' + info.response)
    })
  })
}
