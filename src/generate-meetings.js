import { readParticipants, readMeetings, writeMeetings } from './read-and-write-spreadsheets';

const _ = require('lodash');

/* Might be useful later idk
function getPastMeetingScore(person1Id, person2Id, pastMeetingsPerPerson) {
  return (
    pastMeetingsPerPerson[person1Id].filter(meeting => meeting.includes(person2Id)).length * 10
  );
}
*/

export default function generateMeetings() {
  const allParticipants = readParticipants();

  const numberOfParticipants = Object.keys(allParticipants).length;

  Logger.log(`Total ${numberOfParticipants} participants.`);

  // data of previous meetings
  const pastMeetings = readMeetings();
  const allParticipantIds = Object.keys(allParticipants); // MIGHT BE WRONG, IDK THE STRUCKTURE OF allParticipants
  const pastMeetingsPerPerson = {};

  allParticipantIds.forEach(participantId => {
    const pastMeetingsOfParticipant = pastMeetings.filter(meeting => {
      return meeting.indexOf(participantId) > -1;
    });

    const pastMeetingsOfParticipantCleaned = [...pastMeetingsOfParticipant].filter(
      id => id !== participantId
    );

    pastMeetingsPerPerson[participantId] = pastMeetingsOfParticipantCleaned;
  });

  // Divide participants into meetings

  let meetings;

  if (numberOfParticipants > 5) {
    let groupsOfThree = 0;
    switch (numberOfParticipants % 4) {
      case 0:
        groupsOfThree = 0;
        break;
      case 1:
        groupsOfThree = 3;
        break;
      case 2:
        groupsOfThree = 2;
        break;
      case 3:
        groupsOfThree = 1;
        break;
      default:
        break;
    }

    const totalGroups = (numberOfParticipants - 3 * groupsOfThree) / 4 + groupsOfThree;

    // Meetings go here
    meetings = new Array(totalGroups);
    let meetingIndex = 0;

    // Generating the meetings

    const participantsShuffled = _.shuffle(allParticipants);

    // groups of three
    const pToGroupsOfThree = _.shuffle(participantsShuffled.slice(0, groupsOfThree * 3));

    for (let i = 0; i < groupsOfThree; i += 1) {
      // create an array and add the three participants to it
      const newMeetingOfThree = new Array(3);
      newMeetingOfThree[0] = pToGroupsOfThree[3 * i];
      newMeetingOfThree[1] = pToGroupsOfThree[3 * i + 1];
      newMeetingOfThree[2] = pToGroupsOfThree[3 * i + 2];

      // add the array to all meetings
      meetings[meetingIndex] = newMeetingOfThree;
      meetingIndex += 1;
    }

    // the rest
    const pToGroupsOfFour = _.shuffle(
      participantsShuffled.slice(groupsOfThree * 3, participantsShuffled.length)
    );

    for (let i = 0; i < totalGroups - groupsOfThree; i += 1) {
      // create an array and add the four participants to it

      // fix index for pToGroupsOfFour
      const index = i - groupsOfThree;

      const newMeetingOfFour = new Array(4);
      newMeetingOfFour[0] = pToGroupsOfFour[4 * index];
      newMeetingOfFour[1] = pToGroupsOfFour[4 * index + 1];
      newMeetingOfFour[2] = pToGroupsOfFour[4 * index + 2];
      newMeetingOfFour[3] = pToGroupsOfFour[4 * index + 3];

      // add the array to all meetings
      meetings[meetingIndex] = newMeetingOfFour;
      meetingIndex += 1;
    }
  } else {
    meetings = new Array[1]();
    meetings[1] = allParticipants;
  }

  writeMeetings(meetings);
}
