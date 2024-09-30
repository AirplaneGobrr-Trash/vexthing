const router = require("express").Router()
const rApi = require("../helpers/robotApi")
const utils = require("../helpers/utils")
const multer = require("multer")

router.get("/events/:teamID", async (req, res) => {
  let teamID = req.params.teamID

  const team = await rApi.team(teamID)
  const events = await team.getEvents()

  res.send(events)
})

// TODO: Make this a "BATCH" to prevent sending so many requests
router.get("/data/:eventID/:teamID", async (req, res) => {
  let eventID = req.params.eventID
  let teamID = req.params.teamID
  let imgMode = req.query.picture ?? teamID.includes(".png")
  teamID = teamID.split(".png").shift()
  console.log("upload", teamID)

  let eventData = await rApi.event(eventID).getData()

  if (!eventData) return res.status(404).send(`No event found with ID ${eventID}`)
  let team = await rApi.team(teamID)
  let teamData = team.getData()
  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`)

  let eventStoredData = await utils.getEventData(eventID)
  let teamStoredData = await eventStoredData.getTeamData(teamID)
  if (imgMode) {
    let img = teamStoredData?.picture // TODO: Compress img using sharp
    if (!img) return res.send("No Picture!")
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
    return
  }
  if (teamStoredData) teamStoredData.picture = `http://${req.headers.host}${req.originalUrl}?picture=true`
  res.send(teamStoredData ?? {})
})

router.post("/data/:eventID", async (req, res) => {
  console.log("Running batch request!")
  let eventID = req.params.eventID

  let data = req.body
  let teamIDs = data.teamIDs
  console.log(data, teamIDs)

  let eventData = await rApi.event(eventID).getData()
  if (!eventData) return res.status(404).send(`No event found with ID ${eventID}`)

  let back = {}
  for (let teamID of teamIDs) {
    let team = await rApi.team(teamID)
    let teamData = team.getData()

    back[teamID] = null

    if (!teamData) {
      continue
    }

    let eventStoredData = await utils.getEventData(eventID)
    let teamStoredData = await eventStoredData.getTeamData(teamID)
    if (teamStoredData) {
      let copy = JSON.parse(JSON.stringify(teamStoredData))
      console.log(copy)
      copy.picture = copy.picture ? 1 : 0
      back[teamID] = copy ?? null
    }
  }
  console.log("Done!")
  console.log(back)
  return res.json(back)

  let teamID = req.params.teamID
  let imgMode = req.query.picture ?? teamID.includes(".png")
  teamID = teamID.split(".png").shift()
  console.log("upload", teamID)

  let eventStoredData = await utils.getEventData(eventID)
  let teamStoredData = await eventStoredData.getTeamData(teamID)
  if (imgMode) {
    let img = teamStoredData?.picture
    if (!img) return res.send("No Picture!")
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
    return
  }
  if (teamStoredData) teamStoredData.picture = `http://${req.headers.host}${req.originalUrl}?picture=true`
  res.send(teamStoredData ?? {})
})

const upload = multer()

router.post("/upload/:eventID/:teamID", upload.single("file"), async (req, res) => {
  // req.file.buffer
  let eventID = req.params.eventID
  let teamID = req.params.teamID
  let event = await utils.getEventData(eventID)
  const teamData = await (await rApi.team(teamID)).getData()

  if (req?.file?.buffer) {
    await event.updateTeamData(teamID, {
      picture: req.file.buffer,
      teamID: teamID
    })
    return res.send("Set picture!")
  }
  if (req?.body) {
    let data = req.body
    await event.updateTeamData(teamID, {
      teamNumber: teamData.number,
      ...data
    })
    return res.send("Updated!")
  }
})

module.exports = router