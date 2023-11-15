const dataHelper = require("./dataHelper")
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
  let data = fs.readFileSync(`./layout/${seasonID}.json`)
  return JSON.parse(data)
}

module.exports = {
    getEventData,
    eventDatas,
    getSeasonLayout
}