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
  if (req?.file?.buffer) {
    await event.updateTeamData(teamID, {
      picture: req.file.buffer,
      teamID: teamID
    })
    res.send("Set picture!")
  }
  if (req?.body.teamNumber) {
    let data = req.body
    await event.updateTeamData(teamID, data)
    res.send("Updated!")
  }
})

module.exports = router