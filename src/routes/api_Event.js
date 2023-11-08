const router = require("express").Router()
const rApi = require("../helpers/robotApi")

router.get("/matches/:eventID/:divID", async (req, res)=>{
    let eventID = req.params.eventID
  let divID = req.params.divID

  let event = rApi.event(eventID)
  let eventData = await event.getMacthes(divID, 1)

  res.send(eventData)
})

router.get("/teams/:eventID", async (req, res)=>{
  let eventID = req.params.eventID

  let event = await rApi.event(eventID)
  let eventTeams = await event.getTeams()

  if (!eventTeams) return res.status(404).send(`No event found with ID ${eventID}`)
  res.send(eventTeams)
})

module.exports = router