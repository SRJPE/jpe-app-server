import * as fs from 'fs'

import {
  AlignmentType,
  SectionType,
  PageOrientation,
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  TextDirection,
  HeightRule,
} from 'docx'
// import { uid } from 'uid'
// import { getTwoWeeksPriorDate } from '../../utils/utils'

export const getTwoWeeksPriorDate = () => {
  const currentDate = new Date()
  const twoWeeksPriorDate = new Date(currentDate)
  twoWeeksPriorDate.setDate(currentDate.getDate() - 14)
  return twoWeeksPriorDate.toLocaleDateString()
}
export const generateWordDocument = async (
  BiWeeklyPassageSummaryData: any
): Promise<string> => {
  //organize data
  const {
    fundingAgency,
    personnelLead,
    program,
    catchBiWeekly,
    environmentalBiWeekly,
    releaseBiWeekly,
  } = BiWeeklyPassageSummaryData.values
  console.log('🚀 ~ file: ReportGenerator.tsx:35 ~ program:', program)
  console.log(
    '🚀 ~ file: ReportGenerator.tsx:35 ~ personnelLead:',
    personnelLead
  )
  console.log(
    '🚀 ~ file: ReportGenerator.tsx:35 ~ fundingAgency:',
    fundingAgency
  )
  console.log(
    '🚀 ~ file: ReportGenerator.tsx:35 ~ releaseBiWeekly:',
    releaseBiWeekly
  )
  console.log(
    '🚀 ~ file: ReportGenerator.tsx:35 ~ environmentalBiWeekly:',
    environmentalBiWeekly
  )
  console.log(
    '🚀 ~ file: ReportGenerator.tsx:35 ~ catchBiWeekly:',
    catchBiWeekly
  )
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

  // Packer.toBase64String(doc).then((base64) => {
  //   const filename =
  //     FileSystem.documentDirectory + `MyWordDocument${uid()}.docx`
  //   FileSystem.writeAsStringAsync(filename, base64, {
  //     encoding: FileSystem.EncodingType.Base64,
  //   }).then(() => {
  //     console.log(`Saved file: ${filename}`)
  //     Sharing.shareAsync(filename)
  //   })
  // })

  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync('My Document.docx', buffer)
  })
  // const base64 = await Packer.toBase64String(doc)
  // const filename = FileSystem.documentDirectory + `MyWordDocument${uid()}.docx`
  const filename = 'My Document.docx'
  // await FileSystem.writeAsStringAsync(filename, base64, {
  //   encoding: FileSystem.EncodingType.Base64,
  // })
  // // Sharing.shareAsync(filename)
  // console.log(`Saved file: ${filename}`)

  return filename
}
//  try {
//     const filename =
//       FileSystem.documentDirectory + `MyWordDocument${uid()}.docx`
//     const base64 = await Packer.toBase64String(doc)
//     await FileSystem.writeAsStringAsync(filename, base64, {
//       encoding: FileSystem.EncodingType.Base64,
//     })
//     Sharing.shareAsync(filename)
//     console.log(`Saved file: ${filename}`)
//     return filename
//   } catch (error) {
//     console.error('Error saving file:', error)
//   }
//   return null
// }
