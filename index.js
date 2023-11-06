// index.js:
const { app, express, http, io, server, twing } = require('./web')
const api = require("./api")
const fs = require("fs")
const multer = require("multer")
const dbBuilder = require("@airplanegobrr/database")

app.use("/", express.static("public"))

app.get("/", (req, res)=>{
  twing.render("main.html").then(out=>res.send(out))
})

app.get(`/getTeamEvents/:teamID`, async(req, res)=>{
  let teamID = req.params.teamID
  let events = await api.getTeamEvents(teamID)
  res.send(events)
})

app.get("/:teamNumber", async (req, res)=>{
  let teamNumber = req.params.teamNumber
  const teamData = await api.getTeamWithString(teamNumber)
  if (!teamData) return res.status(404).send(`No team found with number ${teamNumber}`)
  twing.render("eventSelector.html", { teamID: teamData.id }).then(out=>res.send(out))
})

app.get('/team/:eventID/:teamID', async (req, res) => {
  let teamID = req.params.teamID
  const teamData = await api.getTeam(teamID)
  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`)
  console.log(teamData)
  twing.render("team.html", {teamNumber: teamData.number }).then(out=>res.send(out))
});

app.get("/times/:eventID/:teamID", async (req, res)=>{
  let teamID = req.params.teamID
  const teamData = await api.getTeam(teamID)
  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`)
  console.log(teamData)
  twing.render("times.html", {teamNumber: teamData.number }).then(out=>res.send(out))
})

app.get("/data/team/:event/:id", async (req, res)=>{
  let eventID = req.params.event
  let teamID = req.params.id
  const teamData = await api.getTeamWithString(teamID)
  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`)
  const eventData = await api.getEventWithID(eventID)
  if (!eventData) return res.status(404).send(`No event found with ID ${eventID}`)
  fs.mkdirSync(`public/teams/${eventID}`, {recursive:true})
  const db = new dbBuilder({filename: `public/teams/${eventID}/${teamData.id}.json`})
  await db.load()
  res.send(db.data)
})

const upload = multer()

app.post("/upload/:eventID/:teamID", upload.single("file"), (req, res)=>{
  // req.file.buffer
  let eventID = req.params.eventID
  let teamID = req.params.teamID
  fs.mkdirSync(`public/pictures/teams/${eventID}`, {recursive:true})
  fs.writeFileSync(`public/pictures/teams/${eventID}/${teamID}.png`, req.file.buffer)
  res.send(`OK. Updated ${teamID} picture!`)
})

let cache = null

app.get("/getTeamMatches/:eventID/:teamID", async (req, res)=>{
  let eventID = req.params.eventID
  let teamID = req.params.teamID
  res.send(await api.getMatches(eventID, 1, [teamID]))
})

app.get("/getTeamData/:teamID", async (req, res)=>{
  let teamID = req.params.teamID
  res.send(await api.getTeam(teamID))
})

server.listen(3100, () => {
  console.log('listening on *:3100');
});
//<script src='/socket.io/socket.io.js'></script>