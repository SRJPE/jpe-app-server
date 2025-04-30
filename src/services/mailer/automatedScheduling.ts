import { prepareBiWeeklyReportEmailForSend } from '.'
import { getBiWeeklyPassageSummary } from '../../models/reports'

const cron = require('node-cron')

// Hard to schedule bi weekly so we schedule weekly and check if it is an even week

// Function to check if the current week is an even week
const isEvenWeek = () => {
  const currentWeekNumber = Math.ceil(new Date().getDate() / 7)
  return currentWeekNumber % 2 === 0
}
const calculateBiWeeklyPassageSummary = () => {
  return
}
const handleGenerateDocument = () => {
  return
}

const scheduleBiWeeklyReport = async (
  programId: string
  // startDate:Date,
) => {
  // Weekly reports each Monday at 9 AM
  cron.schedule('0 9 * * 1', async () => {
    if (isEvenWeek()) {
      //each time this runs we need to send a newly generated report

      //TASKS TO ADD

      //run queries for the report data
      const biweeklyPassageSummaryReport = await getBiWeeklyPassageSummary(
        programId
      )
      //calculate the table data
      const biweeklyPassageSummaryCalculations =
        calculateBiWeeklyPassageSummary()
      //generate the word document
      const reportDocument = handleGenerateDocument()

      prepareBiWeeklyReportEmailForSend('to', 'subject', 'filePath', true)
    }
  })
}

/*
Realizing some things need to be reorganized


-need to be able to produce a complete report without contact with the client

currently the client is sending a request to the server for the required information.
then the client side produces the word document and makes the required calculations. 
then sends the word document to the server to be attached and sent over email.

We instead need to do more of these tasks on the server side. 
The server should be able to produce the word document and make the required calculations. 
Then the server should be able to send the word document over email on a schedule.


We still want to initialize things on the client, and also have a report preview to display.
so the current implementation is working but needs to be expanded on. 

the cron job needs to be able to run the report generation and email sending on a schedule.

This means that the client needs to also contain an isScheduled bool to decide if the report should be sent immediately or scheduled for later.


if the report is scheduled for later, the client should send the report to the server with the isScheduled bool set to true.
then the server needs to be able to run the report generation and email sending with the correct meta data and week range.

also the calculation for the table data needs to be done on the server side. 
This should just be the case anyway it seems
*/
