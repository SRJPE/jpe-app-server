import { EmailClient } from '@azure/communication-email'
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  PageOrientation,
  Paragraph,
  SectionType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import fs from 'fs/promises'
import path from 'path'

//===========================================
// Mail Service Configuration
//===========================================

export const sendEmail = async ({
  receivers,
  subject,
  plainText,
  html,
  cc,
  bcc,
  attachments,
}: EmailParameters) => {
  // let transporter = nodemailer.createTransport(transportConfig)
  const connectionString = process.env.EMAIL_CONNECTION_STRING
  const client = new EmailClient(connectionString)

  const message = {
    senderAddress:
      'DoNotReply@8be496df-12d6-4468-ad85-cbd102f45c43.azurecomm.net',
    content: {
      subject,
      plainText,
      html,
    },
    recipients: {
      to: receivers,
    },
    attachments,
  }

  const poller = await client.beginSend(message)

  return poller.pollUntilDone()
}

//===========================================
// Content Utility Functions
//===========================================

export const getTwoWeeksPriorDate = () => {
  const currentDate = new Date()
  const twoWeeksPriorDate = new Date(currentDate)
  twoWeeksPriorDate.setDate(currentDate.getDate() - 14)
  return twoWeeksPriorDate.toLocaleDateString()
}

const calculatePassageTotals = data => {
  const totalFishSpring = data.reduce((acc, curr) => {
    return acc + +curr.totalFishSpring
  }, 0)
  const minFishSpringFl = data.reduce((acc, curr) => {
    return acc + +curr.minFishSpringFl
  }, 0)
  const maxFishSpringFl = data.reduce((acc, curr) => {
    return acc + +curr.maxFishSpringFl
  }, 0)
  const totalFishFall = data.reduce((acc, curr) => {
    return acc + +curr.totalFishFall
  }, 0)
  const minFishFallFl = data.reduce((acc, curr) => {
    return acc + +curr.minFishFallFl
  }, 0)
  const maxFishFallFl = data.reduce((acc, curr) => {
    return acc + +curr.maxFishFallFl
  }, 0)
  const totalFishWinter = data.reduce((acc, curr) => {
    return acc + +curr.totalFishWinter
  }, 0)
  const minFishWinterFl = data.reduce((acc, curr) => {
    return acc + +curr.minFishWinterFl
  }, 0)
  const maxFishWinterFl = data.reduce((acc, curr) => {
    return acc + +curr.maxFishWinterFl
  }, 0)
  const totalFishLateFall = data.reduce((acc, curr) => {
    return acc + +curr.totalFishLateFall
  }, 0)
  const minFishLateFallFl = data.reduce((acc, curr) => {
    return acc + +curr.minFishLateFallFl
  }, 0)
  const maxFishLateFallFl = data.reduce((acc, curr) => {
    return acc + +curr.maxFishLateFallFl
  }, 0)
  const totalFishHybrid = data.reduce((acc, curr) => {
    return acc + +curr.totalFishHybrid
  }, 0)
  const minFishHybridFl = data.reduce((acc, curr) => {
    return acc + +curr.minFishHybridFl
  }, 0)
  const maxFishHybridFl = data.reduce((acc, curr) => {
    return acc + +curr.maxFishHybridFl
  }, 0)

  return {
    totalFishSpring,
    minFishSpringFl,
    maxFishSpringFl,
    totalFishFall,
    minFishFallFl,
    maxFishFallFl,
    totalFishWinter,
    minFishWinterFl,
    maxFishWinterFl,
    totalFishLateFall,
    minFishLateFallFl,
    maxFishLateFallFl,
    totalFishHybrid,
    minFishHybridFl,
    maxFishHybridFl,
  }
}

export const prepareBiWeeklyReportEmailForSend = async ({
  to: { recipientEmail, recipientName },
  from: { senderName, senderEmail },
  isScheduled,
  reportContent,
}: {
  to: { recipientEmail: string; recipientName: string }
  from: { senderName: string; senderEmail: string }
  isScheduled: string | boolean
  reportContent: Record<string, any>
}) => {
  const [recipientFirstName, recipientLastName] = recipientName.split(' ')

  const program = reportContent.program.at(0)

  const personnelLead = reportContent.personnelLead.at(0)
  const fundingAgency = reportContent.fundingAgency.at(0)
  const {
    trapVisits,
    catchBiWeekly,
    environmentalBiWeekly,
    releaseBiWeekly,
    trapLocations,
    tableData,
  } = reportContent
  function getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const diffInMs = date.getTime() - startOfYear.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    return Math.ceil((diffInDays + startOfYear.getDay() + 1) / 7)
  }

  // Example usage

  const {
    definition: programLeadAgency,
    description: programLeadAgencyDescription,
  } = fundingAgency
  const { streamName, programName } = program
  const {
    firstName: programLeadFirstName,
    lastName: programLeadLastName,
    email: programLeadEmail,
    phone: programLeadPhoneNumber,
  } = personnelLead

  const programLead = `${programLeadFirstName} ${programLeadLastName}`
  const currentDate = new Date()
  const weekNumber = getWeekNumber(currentDate)
  const systemDate = currentDate.toLocaleDateString()
  const reportStartDate = getTwoWeeksPriorDate()
  // needs to be updated based on the catch raw (we are defaulting to "EXPERT JUDGEMENT" For chinook)"
  const programRunDesignationMethod =
    'length-at-date criteria and expert judgement'

  const trapLocationNames = trapLocations.map(location => location.trapName)

  const calculateHIstoricalCumulativePassage = () => {}
  const calculatePassageEstimates = () => {}

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
                text: programLeadAgencyDescription,
                allCaps: true,
                size: 30,
              }),
              // new TextRun({
              //   text: 'Office Name',
              //   break: 1,
              //   size: 25,
              // }),
              // new TextRun({
              //   text: 'Office Address',
              //   break: 1,
              //   size: 25,
              // }),
              // new TextRun({
              //   text: 'Office Phone Number',
              //   break: 1,
              //   size: 25,
              // }),
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
          createParagraph({ text: 'To: Interested Parties' }),
          createParagraph({
            text: `From: ${programLead}`,
          }),
          createParagraph({
            text: `Subject: Biweekly Report`,
          }),
          createParagraph({
            text: `Please find attached preliminary daily estimates of passage, 90% confidence intervals, and fork length ranges of unmarked juvenile salmonids sampled at ${streamName} for the period ${reportStartDate} through ${systemDate}. Race designation was assigned using ${programRunDesignationMethod}.`,
          }),

          createParagraph({
            text: `Mean cumulative weekly passage of winter Chinook thru ${systemDate} (week ${weekNumber}) for the last 20 years of passage data is {VALUE_1}% ± {VALUE_2}%.`,
          }),
          createParagraph({
            text: `Please note that data contained in these reports is subject to revision as this data is preliminary and undergoing QA/QC procedures.`,
          }),
          createParagraph({
            text: `If you have any questions, please feel free to contact me at ${
              programLeadPhoneNumber ? `${programLeadPhoneNumber}, ` : ''
            }${programLeadEmail}.`,
          }),
          // createTable(),
        ],
      },
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            margin: {
              top: 720, // 0.5 inches
              right: 1440, // 1 inch
              bottom: 720, // 0.5 inches
              left: 1440, // 1 inch
            },
            size: {
              orientation: PageOrientation.LANDSCAPE,
            },
          },
        },
        children: [
          createParagraph({
            fontSize: 20,
            text: `Table 1. — Historical mean cumulative passage for week ${weekNumber} and run. Preliminary estimates of passage by brood-year (BY) and run for unmarked juvenile Chinook salmon and steelhead trout captured by rotary-screw traps at ${streamName} (${trapLocationNames.join(
              ', '
            )}) for the dates listed below. Results include estimated passage, peak river discharge volume, water temperature, turbidity, and fork length (mm) range in parentheses. A dash (-) indicates that sampling was not conducted on that date.`,
          }),
          createParagraph({
            fontSize: 20,
            text: `Preliminary estimates of passage by brood-year (BY) and run for unmarked juvenile Chinook salmon and steelhead trout captured by rotary- screw traps at ${streamName} (${trapLocationNames.join(
              ', '
            )}) for the dates listed below. Results include estimated passage, peak river discharge volume, water temperature, turbidity, and fork length (mm) range in parentheses. A dash (-) indicates that sampling was not conducted on that date.`,
          }),
          createTable({
            tableData: {
              data: tableData,
              headers: [
                'Date',
                'Discharge volume (cfs)',
                'Water temperature (°C)',
                'Water turbidity (NTU)',
                'BY22 Winter',
                'BY22 Spring',
                'BY22 Fall',
                'BY22 \nLate-Fall',
                'BY22 RBT',
              ],
            },
            passageTotals: calculatePassageTotals(tableData),
          }),
          new Paragraph({
            spacing: { before: 100 },

            border: {
              top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
            },
            children: [
              new TextRun({
                text: '1',
                size: 16,
                superScript: true,
              }),
              new TextRun({
                text: ` Biweekly totals may be greater than the sum of the daily estimates presented in this table if sampling was not conducted on each day of the biweekly period. A dash (-) denotes those dates. To estimate daily passage for days that were not sampled, we impute missed sample days with the weekly mean value of days sampled within the week.`,
                size: 20,
              }),
            ],
          }),
          ,
        ],
      },
    ],
  })

  const view = {
    plainText: `Dear ${recipientEmail},  
    
    ${senderName} (${senderEmail}) has shared the biweekly report for the ${programName} covering ${reportStartDate} - ${systemDate}.  
    
    The report is attached as a DOCX file for your review.  
    
    If you have any questions, please contact the program lead, ${programLead} at ${programLeadEmail}.  
    
    Best regards,  
    DataTackle Support Team  
    `,
    html: `<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; overflow:hidden; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding: 20px; background-color: #0A7D7D;">
                            <img src="https://github.com/SRJPE/rst-pilot-app-client/blob/dev/assets/hands_and_bucket_data_tackle_logo.png?raw=true" alt="Data Tackle Logo" width="150" style="display: block; max-width: 100%; border-radius: 50%;">
                        </td>
                    </tr>

                    <!-- Heading -->
                    <tr>
                        <td align="center" style="font-size: 24px; color: #fff; padding-bottom: 15px; background-color: #0A7D7D;">
                           New Biweekly Report
                        </td>
                    </tr>

                    <!-- Message -->
                    <tr>
                        <td style="font-size: 16px; color: #555; line-height: 1.5; padding: 0 20px; padding-top: 25px;">
                            Dear ${recipientFirstName},
                            <br><br>
                         ${senderName} has shared the biweekly report for the ${programName} covering ${reportStartDate} - ${systemDate}.
                          
                          <br/><br/>
The report is attached as a DOCX file for your review.
                          <br/><br/>
                            If you have any questions, please contact the program lead, ${programLead} at <a href="mailto:${programLeadEmail}" style="color: #16687a; text-decoration: none;">${programLeadEmail}</a>.
                           <br/><br/>
                    </tr>

                    <!-- Signature -->
                    <tr>
                        <td style="font-size: 16px; color: #555; line-height: 1.5; padding: 0 20px;">
                            Best regards,<br>
                            <strong>DataTackle Support Team</strong>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 20px 0;">
                            <hr style="border: none; height: 1px; background-color: #ccc; width: 100%;">
                        </td>
                    </tr>

      

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="font-size: 14px; color: #777; padding-bottom: 20px;">
                            &copy; ${new Date().getFullYear()} FlowWest, Inc | All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>`,
  }

  //To send the email with the attachment

  await Packer.toBase64String(doc).then(base64String => {
    sendEmail({
      receivers: [
        {
          address: recipientEmail,
          displayName: recipientName,
        },
      ],
      subject: `Biweekly Report for ${programName} | ${reportStartDate} - ${systemDate}`,
      plainText: view.plainText,
      html: view.html,
      attachments: [
        {
          name: `${programName.split(' ').join('-')}_bi-weekly_${systemDate
            .split('/')
            .join('-')}.docx`,
          contentInBase64: base64String,
          contentType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ],
    })
      .then(response =>
        console.log(
          '🚀 ~ index.ts:455 ~ awaitPacker.toBase64String ~ response:',
          response
        )
      )
      .catch(error => {
        console.error('send error', error)
      })
  })

  // To save the document to the server directory - Document Creation Testing

  // await Packer.toBuffer(doc).then(buffer => {
  //   const filePath = path.join(
  //     __dirname,
  //     `${program.programName.split(' ').join('-')}_${reportStartDate
  //       .split('/')
  //       .join('-')}.docx`
  //   )
  //   fs.writeFile(filePath, buffer)
  // })
}

//===========================================
// Document Constructor Functions
//===========================================

const createParagraph = ({
  text,
  fontSize,
  textAlignment = 'left',
  bold = false,
  spacing,
}: {
  text: string
  fontSize?: number
  bold?: boolean
  spacing?: { before?: number; after?: number }
  textAlignment?:
    | 'left'
    | 'start'
    | 'center'
    | 'end'
    | 'both'
    | 'mediumKashida'
    | 'distribute'
    | 'numTab'
    | 'highKashida'
    | 'lowKashida'
    | 'thaiDistribute'
    | 'right'
}): Paragraph => {
  return new Paragraph({
    spacing: spacing || {
      after: 250,
    },
    alignment: textAlignment,
    children: [
      new TextRun({
        text,
        size: fontSize || 24,
        bold,
      }),
    ],
  })
}

const createTable = ({ tableData: { data, headers }, passageTotals }) => {
  const cellTextSpacing = { after: 50 }
  const totalsRowSpacing = { before: 150, after: 50 }
  const cellFontSize = 20
  const noBorderStyling = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  }

  return new Table({
    borders: noBorderStyling,
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
          ...headers.map((headerText, index) => {
            return new TableCell({
              borders: noBorderStyling,
              margins: { left: 100, right: 100 },
              verticalAlign: 'center',

              children: [
                createParagraph({
                  text: headerText,
                  fontSize: cellFontSize,
                  textAlignment: index ? 'right' : 'left',
                  spacing: cellTextSpacing,
                }),
              ],
              width: {
                size: 100 / headers.length,
                type: WidthType.PERCENTAGE,
              },
            })
          }),
        ],
      }),
      ...data.map(
        item =>
          new TableRow({
            children: [
              new TableCell({
                borders: noBorderStyling,
                children: [
                  createParagraph({
                    text: `${Intl.DateTimeFormat('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                    }).format(new Date(item.trapVisitTimeEnd))}`,
                    fontSize: cellFontSize,
                    spacing: cellTextSpacing,
                  }),
                ],
                width: {
                  size: 100 / headers.length,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                borders: noBorderStyling,
                children: [
                  createParagraph({
                    text: `${item.discharge}`,
                    fontSize: cellFontSize,
                    textAlignment: 'right',
                    spacing: cellTextSpacing,
                  }),
                ],
                width: {
                  size: 100 / headers.length,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                borders: noBorderStyling,
                children: [
                  createParagraph({
                    text: `${item.waterTemp}`,
                    fontSize: cellFontSize,
                    textAlignment: 'right',
                    spacing: cellTextSpacing,
                  }),
                ],
                width: {
                  size: 100 / headers.length,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                borders: noBorderStyling,
                children: [
                  createParagraph({
                    text: `${item.waterTurbidity ?? 'N/A'}`,
                    fontSize: cellFontSize,
                    textAlignment: 'right',
                    spacing: cellTextSpacing,
                  }),
                ],
                width: {
                  size: 100 / headers.length,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                borders: noBorderStyling,
                children: [
                  createParagraph({
                    text: item.totalFishWinter,
                    fontSize: cellFontSize,
                    textAlignment: 'right',
                    spacing: cellTextSpacing,
                  }),
                ],
                width: {
                  size: 100 / headers.length,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                borders: noBorderStyling,
                children: [
                  createParagraph({
                    text: item.totalFishSpring,
                    fontSize: cellFontSize,
                    textAlignment: 'right',
                    spacing: cellTextSpacing,
                  }),
                ],
                width: {
                  size: 100 / headers.length,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                borders: noBorderStyling,
                children: [
                  createParagraph({
                    text: item.totalFishFall,
                    fontSize: cellFontSize,
                    textAlignment: 'right',
                    spacing: cellTextSpacing,
                  }),
                ],
                width: {
                  size: 100 / headers.length,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                borders: noBorderStyling,
                children: [
                  createParagraph({
                    text: item.totalFishLateFall,
                    fontSize: cellFontSize,
                    textAlignment: 'right',
                    spacing: cellTextSpacing,
                  }),
                ],
                width: {
                  size: 100 / headers.length,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                borders: noBorderStyling,
                children: [
                  createParagraph({
                    text: item.totalFishHybrid,
                    fontSize: cellFontSize,
                    textAlignment: 'right',
                    spacing: cellTextSpacing,
                  }),
                ],
                width: {
                  size: 100 / headers.length,
                  type: WidthType.PERCENTAGE,
                },
              }),
            ],
          })
      ),
      new TableRow({
        children: [
          new TableCell({
            borders: noBorderStyling,
            columnSpan: 4,
            children: [
              new Paragraph({
                spacing: totalsRowSpacing,
                children: [
                  new TextRun({
                    text: 'Biweekly Total ',
                    size: 22,
                    bold: true,
                  }),
                  new TextRun({
                    text: '2',
                    size: 18,
                    bold: true,
                    superScript: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `${passageTotals.totalFishWinter}`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                bold: true,
                spacing: totalsRowSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `${passageTotals.totalFishSpring}`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                bold: true,
                spacing: totalsRowSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `${passageTotals.totalFishFall}`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                bold: true,
                spacing: totalsRowSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `${passageTotals.totalFishLateFall}`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                bold: true,
                spacing: totalsRowSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `${passageTotals.totalFishHybrid}`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                bold: true,
                spacing: totalsRowSpacing,
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: noBorderStyling,
            columnSpan: 4,
            children: [
              new Paragraph({
                spacing: cellTextSpacing,
                children: [
                  new TextRun({
                    text: 'Biweekly Lower 90% Confidence Interval ',
                    size: 22,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: noBorderStyling,
            columnSpan: 4,
            children: [
              new Paragraph({
                spacing: cellTextSpacing,
                children: [
                  new TextRun({
                    text: 'Biweekly Upper 90% Confidence Interval ',
                    size: 22,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: noBorderStyling,
            columnSpan: 4,
            children: [
              createParagraph({
                text: 'Brood Year Total ',
                fontSize: 22,
                bold: true,
                spacing: totalsRowSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `${passageTotals.totalFishWinter}`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                bold: true,
                spacing: totalsRowSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `${passageTotals.totalFishSpring}`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                bold: true,
                spacing: totalsRowSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `${passageTotals.totalFishFall}`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                bold: true,
                spacing: totalsRowSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `${passageTotals.totalFishLateFall}`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                bold: true,
                spacing: totalsRowSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `${passageTotals.totalFishHybrid}`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                bold: true,
                spacing: totalsRowSpacing,
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: noBorderStyling,
            columnSpan: 4,
            children: [
              new Paragraph({
                spacing: cellTextSpacing,
                children: [
                  new TextRun({
                    text: 'Brood year Lower 90% Confidence Interval',
                    size: 22,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: noBorderStyling,
            columnSpan: 4,
            children: [
              new Paragraph({
                spacing: cellTextSpacing,
                children: [
                  new TextRun({
                    text: 'Brood year Upper 90% Confidence Interval',
                    size: 22,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
          new TableCell({
            borders: noBorderStyling,
            children: [
              createParagraph({
                text: `not calculated`,
                fontSize: cellFontSize,
                textAlignment: 'right',
                spacing: cellTextSpacing,
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

//===========================================
// Interfaces & Types
//===========================================

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
  receivers: { address: string; displayName: string }[]
  subject: string
  plainText: string
  html?: string
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
