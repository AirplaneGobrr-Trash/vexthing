// index.js:
const { app, express, http, io, server, twing } = require('./helpers/web')
const rApi = require("./helpers/robotApi")

app.use("/static", express.static("public"))

app.use("/api", require("./routes/api"))

const config = require("./config.json")

app.get("/", (req, res) => {
  twing.render("main.html", {
    mainTeams: config.mainTeams,
    teams: config.teams
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

app.get("/times/:eventID/:divID/:teamID", async (req, res) => {
  let teamID = req.params.teamID

  const team = await rApi.team(teamID)
  const teamData = await team.getData()

  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`)
  twing.render("times.html", { teamNumber: teamData.number }).then(out => res.send(out))
})

app.get('/team/:eventID/:teamID', async (req, res) => {
  let teamID = req.params.teamID
  let eventID = req.params.eventID

  const team = await rApi.team(teamID)
  const teamData = await team.getData()

  let eventData = await rApi.event(eventID).getData()
  if (!eventData) return res.status(404).send(`No event found with ID ${eventID}`)

  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`)
  twing.render("team.html", { teamNumber: teamData.number }).then(out => res.send(out))
});

server.listen(3100, () => {
  console.log('listening on *:3100');
});
//<script src='/socket.io/socket.io.js'></script>