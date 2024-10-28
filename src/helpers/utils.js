const dataHelper = require("./dataHelper")
const path = require("path")
const fs = require("fs")
const eventDatas = {}

/**
 * 
 * @param {Number} eventID
 * @returns {dataHelper.eventData}
 */
async function getEventData(eventID) {
  let event = eventDatas[eventID]
  if (event) return event
  eventDatas[eventID] = new dataHelper.eventData(eventID)
  return eventDatas[eventID]
}

async function getSeasonLayout(seasonID){
  let jsFile = path.join(__dirname, "..","layout", `${seasonID}.js`)
  let jsonFile = `./layout/${seasonID}.json`

  console.log("jsFile",jsFile)

  if (fs.existsSync(jsFile)) {
    return require(jsFile)
  } else if (fs.existsSync(jsonFile)) {
    return JSON.parse(fs.readFileSync(jsonFile))
  }
  return null
}

function teamSort(a, b) {
  const aNumber = parseInt(a.teamNumber.match(/\d+/)[0]);
  const bNumber = parseInt(b.teamNumber.match(/\d+/)[0]);

  // Compare the numeric parts
  if (aNumber < bNumber) {
      return -1;
  } else if (aNumber > bNumber) {
      return 1;
  } else {
      // If the numeric parts are equal, compare the letters
      const aLetters = a.teamNumber.match(/[A-Za-z]+/)[0];
      const bLetters = b.teamNumber.match(/[A-Za-z]+/)[0];

      return aLetters.localeCompare(bLetters);
  }
}

module.exports = {
    getEventData,
    eventDatas,
    getSeasonLayout,
    teamSort
}