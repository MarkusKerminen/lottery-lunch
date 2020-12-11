const meetingSheetName = 'Meetings';
const responseSheetName = 'Form Responses 1';
const settingsSheetName = 'Settings';

/* Not needed as of now
// convert spreadsheet column letter to number starting from 1
function parseColumnTypeLetterToNumber(letter) {
  let column = 0;
  const { length } = letter;
  for (let i = 0; i < length; i += 1) {
    column += (letter.charCodeAt(i) - 64) * 26 ** (length - i - 1);
  }
  return column - 1;
}
*/

function parseParticipantRow(participantData) {
  const lastUpdatedColumn = 0;
  const firstNameColumn = 1;
  const emailColumn = 2;
  const subscriptionColumn = 3;
  const lastNameColumn = 4;

  const firstName = participantData[firstNameColumn] ? participantData[firstNameColumn].trim() : '';
  const lastName = participantData[lastNameColumn] ? participantData[lastNameColumn].trim() : '';

  const fullName = `${firstName} ${lastName}`;

  const participant = {
    lastUpdated: participantData[lastUpdatedColumn],
    firstName,
    lastName,
    fullName,
    email: participantData[emailColumn].trim().toLowerCase(),
    isSubscribed: participantData[subscriptionColumn] === 'Kyllä'
  };

  return participant;
}

// finds and lists currently subscribed participants
function getSubscribedParticipants(participants) {
  const subscribedDatapoints = {};
  const unsubscribedDatapoints = {};

  participants.forEach(p => {
    if (p.isSubscribed) {
      subscribedDatapoints[p.email] = p;
    } else {
      unsubscribedDatapoints[p.email] = p;
    }
  });

  // delete participants if they have unsubscribed after subscribing
  Object.keys(unsubscribedDatapoints).forEach(key => {
    const unsubscribeTime = new Date(unsubscribedDatapoints[key].lastUpdated).getTime();
    const subscribeTime = subscribedDatapoints[key]
      ? new Date(subscribedDatapoints[key].lastUpdated)
      : 0;

    if (subscribeTime < unsubscribeTime) delete subscribedDatapoints[key];
  });

  Logger.log(`getSubscribedParticipants() LOG:\n${Object.keys(subscribedDatapoints)}\n`);

  return subscribedDatapoints;
}

export function readParticipants() {
  const responseSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(responseSheetName);

  const sheetRawData = responseSheet
    .getRange(1, 1, responseSheet.getLastRow(), responseSheet.getLastColumn())
    .getValues();

  const columnHeaderRow = sheetRawData[0];
  const participantRows = sheetRawData.slice(1);
  const parsedParticipants = participantRows.map(row => parseParticipantRow(row, columnHeaderRow));
  const participantsObject = getSubscribedParticipants(parsedParticipants);

  return participantsObject;
}

export function readMeetings() {
  const meetingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(meetingSheetName);
  const hasData = meetingSheet.getLastRow() > 1;

  const meetingRawData = hasData
    ? meetingSheet
        .getRange(2, 1, meetingSheet.getLastRow() - 1, meetingSheet.getLastColumn())
        .getValues()
    : [];

  const trimmedMeetingData = meetingRawData.length
    ? meetingRawData.map(meeting => {
        // USING AN ARRAY TO SUPPORT 3 TO 4 PEOPLE
        const people =
          meeting[4] === 'none'
            ? [
                meeting[1].replace(',', '').trim(),
                meeting[2].replace(',', '').trim(),
                meeting[3].replace(',', '').trim()
              ]
            : [
                meeting[1].replace(',', '').trim(),
                meeting[2].replace(',', '').trim(),
                meeting[3].replace(',', '').trim(),
                meeting[4].replace(',', '').trim()
              ];
        const emailSentText = meeting[0];
        return [emailSentText, people];
      })
    : [];

  return trimmedMeetingData;
}

// HAS TO BE FIXED PROBABLY
export function writeMeetings(newMeetings) {
  const meetingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(meetingSheetName);
  const rangeToWrite = meetingSheet.getRange(
    meetingSheet.getLastRow() + 1,
    2,
    newMeetings.length,
    3
  );
  rangeToWrite.setValues(newMeetings);
}

export function writeEmailSent(row, stringToWrite) {
  const meetingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(meetingSheetName);
  const cellToWrite = meetingSheet.getRange(row, 1);
  cellToWrite.setValue(stringToWrite);
}

export function readSettings() {
  const settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(settingsSheetName);
  const settingsRaw = settingsSheet.getRange(2, 2, 6, 1).getValues();

  const settings = {
    typeAScore: settingsRaw[0][0] ? settingsRaw[0][0] : 5,
    typeBScore: settingsRaw[1][0] ? settingsRaw[1][0] : 5,
    leftOverPerson: settingsRaw[2][0],
    senderNameRaw: settingsRaw[3][0],
    subjectRaw: settingsRaw[4][0],
    htmlBodyRaw: settingsRaw[5][0]
  };

  return settings;
}
