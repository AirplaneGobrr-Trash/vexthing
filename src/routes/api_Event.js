const router = require("express").Router()
const rApi = require("../helpers/robotApi")
const utils = require("../helpers/utils")

router.get("/matches/:eventID/:divID", async (req, res)=>{
    let eventID = req.params.eventID
  let divID = req.params.divID

  let event = rApi.event(eventID)
  let eventData = await event.getMacthes(divID, 1)

  res.send(eventData)
})

router.get("/skills/:eventID", async (req, res)=>{
  let eventID = req.params.eventID

  let event = rApi.event(eventID)
  let eventData = await event.getSkills(1)

  res.send(eventData)
})

router.get("/teams/:eventID", async (req, res)=>{
  let eventID = req.params.eventID

  let event = await rApi.event(eventID)
  let eventTeams = await event.getTeams()

  if (!eventTeams) return res.status(404).send(`No event found with ID ${eventID}`)
  res.send(eventTeams)
})

router.get("/:eventID/layout", async (req, res)=>{
  let eventID = req.params.eventID

  let eventData = await (await rApi.event(eventID)).getData()
  res.json(await utils.getSeasonLayout(eventData.season.id))
})


router.get("/ranks/:eventID/:divID", async (req, res)=>{
  let eventID = req.params.eventID
  let divID = req.params.divID

  let event = await rApi.event(eventID)
  let rankingData = await event.getRankings(divID)

  res.send(rankingData)
})

module.exports = router