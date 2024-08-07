import nodemailer from 'nodemailer'
// import { emailCredentials } from '../../config'
import styles from './emailStyles'
// const nodemailer = require('nodemailer')
// const fs = require('fs')
const fs = require('fs').promises
const path = require('path')

export const emailCredentials = {
  service: 'gmail',
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
}

export const getFileContentFromPath = async (filePath: string) => {
  let content = await fs.readFile(filePath)
  // let content = await fs.readFile(path.resolve(__dirname, filePath))
  return content
}

export const testFunc = async (
  to: string,
  subject: string,
  filePath: string
) => {
  const filePath2: string =
    '/Users/benpintel/Library/Developer/CoreSimulator/Devices/8EA30276-B40B-4D98-8CE9-6022794D2B75/data/Containers/Data/Application/9C4D1E7C-BFA2-4F68-8565-BB9DFA427F1C/Documents/ExponentExperienceData/@hunterh/rst-pilot-app/MyWordDocument175e77526bc.docx'
  const fileContent = await getFileContentFromPath(filePath2)
  console.log('🚀 ~ fileContent:', fileContent)
  // const fileContentSync = fs.readFileSync(path.resolve(__dirname, filePath2))
  // console.log('🚀 ~ fileContentSync:', fileContentSync)

  const view = {
    html: `
      <p>Hi ,</p>

      <p> has begun the for the following charter: (Charter DCN:)</a></strong>. </p>
    `,
    text: `Hi, $,
    \n\n
    has begun the for the following charter:\n (Charter DCN:).
   `,
  }
  return await sendEmail({
    receivers: ['bpintel@flowwest.com'],
    subject: `test subject`,
    body: view.text,
    htmlBody: view.html,
    attachments: [
      {
        filename: filePath2,
        content: fileContent,
        // content: fileContentSync,
      },
    ],
  }).catch((error) => {
    console.error(error)
  })
}

// export const testFunc2 = async (to, subject, filePath) => {
//   console.log('🚀 ~ reportRouter.post ~ filePath:', filePath)
//   console.log('🚀 ~ reportRouter.post ~ subject:', subject)
//   console.log('🚀 ~ reportRouter.post ~ to:', to)

//   // })
//   // console.log('🚀 ~ reportRouter.post ~ transporter:', transporter)

//   try {
//     // Create a transporter object using SMTP transport
//     let transporter = await nodemailer.createTransport(emailCredentials)
//     //  Read the file content
//     // const fileContent = fs.readFileSync(path.resolve(__dirname, filePath))

//     // Read the file content asynchronously
//     const fileContent = await fs.readFile(path.resolve(__dirname, filePath))
//     // console.log('🚀 ~ reportRouter.post ~ fileContent:', fileContent)

//     // Set up email data
//     let mailOptions = {
//       from: '"Document Viewer" <your-email@gmail.com>', // Sender address
//       to: to, // List of receivers
//       subject: subject, // Subject line
//       text: 'Please find the attached document.', // Plain text body
//       attachments: [
//         {
//           filename: path.basename(filePath),
//           content: fileContent,
//         },
//       ],
//     }
//     console.log('🚀 ~ reportRouter.post ~ mailOptions:', mailOptions)

//     // res.status(200).send(['Email sent: ', mailOptions])
//     // .send(['Email sent: ', {  }])

//     // // Send mail with defined transport object
//     // transporter.sendMail(mailOptions, (error, info) => {
//     //   if (error) {
//     //     return res.status(500).send(error.toString())
//     //   }
//     //   res.status(200).send('Email sent: ' + info.response)
//     // })
//   } catch (error) {
//     console.error(error)
//   }
// }

interface AttachmentInterface {
  filename: string // - filename to be reported as the name of the attached file. Use of unicode is allowed.
  content: string | Buffer // - String, Buffer or a Stream contents for the attachment
  path: string // - path to the file if you want to stream the file instead of including it (better for larger attachments)
  href: string // – an URL to the file (data uris are allowed as well)
  httpHeaders: { [key: string]: string } // - optional HTTP headers to pass on with the href request, eg. {authorization: "bearer ..."}
  contentType: string // - optional content type for the attachment, if not set will be derived from the filename property
  contentDisposition: string // - optional content disposition type for the attachment, defaults to ‘attachment’
  cid: string // - optional content id for using inline images in HTML message source
  encoding: string // - If set and content is string, then encodes the content to a Buffer using the specified encoding. Example values: ‘base64’, ‘hex’, ‘binary’ etc. Useful if you want to use binary attachments in a JSON formatted email object.
  headers: string // - custom headers for the attachment node. Same usage as with message headers
  raw: string // - is an optional special value that overrides entire contents of current mime node including mime headers. Useful if you want to prepare node contents yourself
}

interface EmailParameters {
  sender?: string
  receivers: string[] | string
  subject: string
  body: string
  htmlBody?: string
  cc?: string[]
  bcc?: string[]
  attachments?: any //AttachmentInterface
  transportConfig?: {
    host: string
    port: number
    secure: boolean
    auth: { user: string; pass: string }
  }
}

export const sendEmail = async ({
  sender = emailCredentials.auth.user,
  receivers,
  subject,
  body,
  htmlBody,
  cc,
  bcc,
  attachments,
  transportConfig = emailCredentials,
}: EmailParameters) => {
  let transporter = nodemailer.createTransport(transportConfig)

  const formattedHtml = `
    <body style='${styles.emailBody}'>
      <div style='${styles.contentWrapper}'>
        <div style='${styles.header}'>
          <img style='${styles.headerLogo}' src='https://www.usbr.gov/img/logo-white.png'/>
          <p>Charter Tracking</p>
        </div>
        <div style='${styles.textWrapper}'>
          ${htmlBody}
        </div>
      </div>
    </body>
    `

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: sender,
    to: receivers,
    subject: subject,
    text: body,
    ...(formattedHtml && { html: formattedHtml }),
    ...(cc && { cc: cc }),
    ...(bcc && { bcc: bcc }),
    ...(attachments && { attachments: attachments }),
  })

  return info
}
