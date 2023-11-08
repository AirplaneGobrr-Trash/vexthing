const dataHelper = require("./dataHelper")
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

module.exports = {
    getEventData,
    eventDatas
}