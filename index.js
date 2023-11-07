// index.js:
const { app, express, http, io, server, twing } = require('./web')
const rApi = require("./robotApi")
const fs = require("fs")
const multer = require("multer")
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

app.use("/", express.static("public"))

app.get("/", (req, res) => {
  twing.render("main.html", {
    mainTeams: ["6627Y", "6627S"],
    teams: ["6627A", "6627B", "6627C", "6627D", "6627X"]
  }).then(out => res.send(out))
})

app.get("/t/:teamNumber", async (req, res) => {
  let teamNumber = req.params.teamNumber

  const team = await rApi.team(teamNumber)
  console.log(team)
  const teamData = await team.getData()

  if (!teamData) return res.status(404).send(`No team found with number ${teamNumber}`)
  twing.render("eventSelector.html", { teamID: teamData.id }).then(out => res.send(out))
})

app.get(`/getTeamEvents/:teamID`, async (req, res) => {
  let teamID = req.params.teamID

  const team = await rApi.team(teamID)
  const events = await team.getEvents()

  res.send(events)
})

app.get("/times/:eventID/:divID/:teamID", async (req, res) => {
  let teamID = req.params.teamID

  const team = await rApi.team(teamID)
  const teamData = await team.getData()

  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`)
  twing.render("times.html", { teamNumber: teamData.number }).then(out => res.send(out))
})

app.get("/getMatches/:eventID/:divID", async (req, res) => {
  let eventID = req.params.eventID
  let divID = req.params.divID

  let event = rApi.event(eventID)
  let eventData = await event.getMacthes(divID, 1)

  res.send(eventData)
})

app.get("/teams/:eventID", async (req, res) => {
  let eventID = req.params.eventID

  let event = await rApi.event(eventID)
  let eventTeams = await event.getTeams()

  if (!eventTeams) return res.status(404).send(`No event found with ID ${eventID}`)
  res.send(eventTeams)
})

app.get('/team/:eventID/:teamID', async (req, res) => {
  let teamID = req.params.teamID

  const team = await rApi.team(teamID)
  const teamData = await team.getData()

  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`)
  twing.render("team.html", { teamNumber: teamData.number }).then(out => res.send(out))
});

app.get("/data/team/:eventID/:teamID", async (req, res) => {
  let eventID = req.params.eventID
  let teamID = req.params.teamID
  let imgMode = req.query.picture ?? teamID.includes(".png")
  teamID = teamID.split(".png").shift()
  console.log("upload",teamID)

  let eventData = await rApi.event(eventID).getData()

  if (!eventData) return res.status(404).send(`No event found with ID ${eventID}`)
  let team = await rApi.team(teamID)
  let teamData = team.getData()
  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`)

  let eventStoredData = await getEventData(eventID)
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

app.post("/upload/:eventID/:teamID", upload.single("file"), async (req, res) => {
  // req.file.buffer
  let eventID = req.params.eventID
  let teamID = req.params.teamID
  let event = await getEventData(eventID)
  if (req.file && req.file.buffer) {
    await event.updateTeamData(teamID, {
      picture: req.file.buffer,
      teamID: teamID
    })
    res.send("Set picture!")
  }
  if (req.body && req.body.teamNumber) {
    let data = req.body
    await event.updateTeamData(teamID, data)
    res.send("Updated!")
  }


})

app.get("/getTeamData/:teamID", async (req, res) => {
  let teamID = req.params.teamID

  let team = await rApi.team(teamID)
  let teamData = await team.getData()

  res.send(teamData)
})

server.listen(3100, () => {
  console.log('listening on *:3100');
});
//<script src='/socket.io/socket.io.js'></script>