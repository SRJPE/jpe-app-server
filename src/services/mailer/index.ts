import nodemailer from 'nodemailer'
// import { emailCredentials } from '../../config'
import styles from './emailStyles'
import { ConfidentialClientApplication } from '@azure/msal-node'
// const nodemailer = require('nodemailer')
// const fs = require('fs')
const fs = require('fs').promises
const path = require('path')
import {
  SectionType,
  Paragraph,
  Document,
  TextRun,
  Table,
  TableRow,
  WidthType,
  TableCell,
  AlignmentType,
  PageOrientation,
  Packer,
} from 'docx'

const msalConfig = {
  auth: {
    // clientId: process.env.CLIENT_ID,
    clientId: process.env.JPE_SERVER_API_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
    clientSecret: process.env.JPE_SERVER_API_CLIENT_SECRET,
  },
}

const cca = new ConfidentialClientApplication(msalConfig)

const getAccessToken = async () => {
  const result = await cca.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  })
  return result.accessToken
}

export const emailCredentials = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT as unknown as number,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
}

// export const getFileContentFromPath = async (
//   filePath: string
// ): Promise<Buffer> => {
//   try {
//     const content = await fs.readFile(filePath)
//     return content
//   } catch (error) {
//     console.error(`Error reading file from path ${filePath}:`, error)
//     throw error
//   }
// }

export const getTwoWeeksPriorDate = () => {
  const currentDate = new Date()
  const twoWeeksPriorDate = new Date(currentDate)
  twoWeeksPriorDate.setDate(currentDate.getDate() - 14)
  return twoWeeksPriorDate.toLocaleDateString()
}

export const prepareBiWeeklyReportEmailForSend = async ({
  to,
  subject,
  isScheduled,
  reportContent,
}: {
  to: string
  subject: string
  isScheduled: string | boolean
  reportContent: Record<string, any>
}) => {
  console.log('🚀 ~ index.ts:37 ~ reportContent:', reportContent)
  console.log('🚀 ~ index.ts:38 ~ isScheduled:', isScheduled)
  console.log('🚀 ~ index.ts:39 ~ subject:', subject)
  console.log('🚀 ~ index.ts:40 ~ to:', to)

  const program = reportContent.program.at(0)
  const personnelLead = reportContent.personnelLead.at(0)
  const fundingAgency = reportContent.fundingAgency.at(0)
  const { trapVisits, catchBiWeekly, environmentalBiWeekly, releaseBiWeekly } =
    reportContent

  const { definition: programLeadAgency } = fundingAgency
  const { streamName } = program
  const {
    firstName,
    lastName,
    email: programLeadEmail,
    phone: programLeadPhoneNumber,
  } = personnelLead
  const programLead = `${firstName} ${lastName}`
  const systemDate = new Date().toLocaleDateString()
  const reportStartDate = getTwoWeeksPriorDate()
  // needs to be updated based on the catch raw (we are defaulting to "EXPERT JUDGEMENT" For chinook)"
  const programRunDesignationMethod = 'TEST RUN METHOD'

  const createParagraph = (text: string): Paragraph => {
    return new Paragraph({
      spacing: {
        after: 250,
      },
      children: [
        new TextRun({
          text,
          size: 25,
        }),
      ],
    })
  }
  const calculateHIstoricalCumulativePassage = () => {}
  const calculatePassageEstimates = () => {}
  const tableData1 = {
    headers: [
      'Date',
      'Discharge volume (cfs)',
      'Water temperature (°C)',
      'Water turbidity (NTU)',
      'BY22 Winter',
      'BY22 Spring',
      'BY22 Fall',
      'BY22 Late-Fal',
      'BY22 RBT',
    ],
  }
  const tableData2 = {
    headers: [
      'Date',
      'Discharge volume (cfs)',
      'Water temperature (°C)',
      'Water turbidity (NTU)',
      'BY22 Winter',
      'BY22 Spring',
      'BY22 Fall',
      'BY22 Late-Fal',
      'BY22 RBT',
    ],
  }

  const createTable = (tableData: any) => {
    return new Table({
      width: {
        // size: 14535,
        // type: WidthType.DXA,
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          tableHeader: true,
          // height: { value: 40, rule: HeightRule.AUTO },
          children: [
            ...tableData.headers.map((headerText: string) => {
              return new TableCell({
                // width: {
                //   size: 3505,
                //   type: WidthType.DXA,
                // },

                children: [new Paragraph(headerText)],
                width: {
                  size: 100 / tableData.headers.length,
                  type: WidthType.PERCENTAGE,
                },
              })
            }),
          ],
        }),
      ],
    })
  }

  let doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            // heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 300,
            },
            children: [
              new TextRun({
                text: 'United States Department of the Interior',
                bold: true,
                size: 50,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 800,
            },
            children: [
              new TextRun({
                text: 'FISH AND WILDLIFE SERVICE',
                allCaps: true,
                size: 30,
              }),
              new TextRun({
                text: 'Red Bluff Fish & Wildlife Office',
                break: 1,
                size: 25,
              }),
              new TextRun({
                text: '10950 Tyler Road, Red Bluff, California 96080',
                break: 1,
                size: 25,
              }),
              new TextRun({
                text: '(530) 527-3043, FAX (530) 529-0292',
                break: 1,
                size: 25,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: {
              after: 250,
            },
            children: [
              new TextRun({
                text: `${systemDate}`,
                size: 25,
              }),
            ],
          }),
          createParagraph('To: Interested Parties'),
          createParagraph(`From: ${programLead}, ${programLeadAgency}`),
          createParagraph(
            `Subject: Biweekly report(${reportStartDate} - ${systemDate})`
          ),
          createParagraph(
            `Please find attached preliminary daily estimates of passage, 90% confidence intervals, and fork length ranges of unmarked juvenile salmonids sampled at ${streamName} for the period ${reportStartDate} through ${systemDate}. Race designation was assigned using ${programRunDesignationMethod}.`
          ),
          createParagraph(
            `Please note that data contained in these reports is subject to revision as this data is preliminary and undergoing QA/QC procedures.`
          ),
          createParagraph(
            `If you have any questions, please feel free to contact me at ${programLeadPhoneNumber}, ${programLeadEmail}.`
          ),
          // createTable(),
        ],
      },
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
            },
          },
        },
        children: [
          createParagraph(
            `Table 1.─ 
            Historical mean cumulative passage for week [System week] and run. Preliminary estimates of passage by brood-year (BY) and run for unmarked juvenile Chinook salmon and steelhead trout captured by rotary- screw traps at Red Bluff Diversion Dam (RK391), Sacramento River, CA, for the dates listed below. Results include estimated passage, peak river discharge volume, water temperature, turbidity, and fork length (mm) range in parentheses. A dash (-) indicates that sampling was not conducted on that date.`
          ),
          createParagraph(
            `Preliminary estimates of passage by brood-year (BY) and run for unmarked juvenile Chinook salmon and steelhead trout captured by rotary- screw traps at Red Bluff Diversion Dam (RK391), Sacramento River, CA, for the dates listed below. Results include estimated passage, peak river discharge volume, water temperature, turbidity, and fork length (mm) range in parentheses. A dash (-) indicates that sampling was not conducted on that date.`
          ),
          createTable(tableData1),
          createParagraph(`Table 2.- Passage Estimates`),
          createParagraph(
            `[Generate table 2 based on querying database and expanding daily counts to passage estimate based on baileys efficiency - you will need to query catch, environmental, and releases (past 2 weeks`
          ),
          createTable(tableData2),
        ],
      },
    ],
  })

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

  await Packer.toBuffer(doc).then(buffer => {
    // const filePath = path.join(
    //   __dirname,
    //   `${program.programName.split(' ').join('-')}_${reportStartDate
    //     .split('/')
    //     .join('-')}.docx`
    // )
    // fs.writeFile(filePath, buffer)

    sendEmail({
      receivers: ['wwhitfield@flowwest.com', 'jhoang@flowwest.com'],
      subject: `test subject`,
      body: view.text,
      htmlBody: view.html,
      attachments: [
        {
          filename: `${program.programName
            .split(' ')
            .join('-')}_${reportStartDate.split('/').join('-')}.docx`,
          content: buffer,
        },
      ],
    }).catch(error => {
      console.error('send error', error)
    })
  })

  // return await sendEmail({
  //   receivers: ['jhoang@flowwest.com'],
  //   subject: `test subject`,
  //   body: view.text,
  //   htmlBody: view.html,
  //   attachments: [
  //     {
  //       filename: filePath2,
  //       content: fileContent,
  //       // content: fileContentSync,
  //     },
  //   ],
  // }).catch(error => {
  //   console.error(error)
  // })
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
  // let transporter = nodemailer.createTransport(transportConfig)
  const accessToken = await getAccessToken()

  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      accessToken: accessToken,
    },
  })

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
  let info = await transporter.sendMail(
    {
      from: sender,
      to: receivers,
      subject: subject,
      text: body,
      ...(formattedHtml && { html: formattedHtml }),
      ...(cc && { cc: cc }),
      ...(bcc && { bcc: bcc }),
      ...(attachments && { attachments: attachments }),
    },
    (error, info) => {
      if (error) {
        return console.log('🚀 ~ index.ts:475 ~ error:', error)
      }
      console.log('🚀 ~ index.ts:477 ~ Email sent: ' + info.response)
    }
  )

  return info
}
