// index.js:
const { app, express, http, io, server, twing } = require('./web')
const api = require("./api")
const fs = require("fs")
const multer = require("multer")
const dataHelper = require("./dataHelper")

const events = {}

async function m(){
  let s1 = performance.now()
  let e = await api.getEventWithID(53579)
  let e1 = performance.now()
  setTimeout(async ()=>{
    let s2 = performance.now()
    await api.getEventWithID(53579)
    let e2 = performance.now()
  console.log(e1-s1, e2-s2)
  }, 1000)
  
  // console.log(await (await api.getEventWithID)(53579))
}

/**
 * 
 * @param {Number} eventID 
 * @returns {dataHelper.event}
 */
async function getEvent(eventID) {
  let event = events[eventID]
  if (event) return event
  events[eventID] = new dataHelper.event(eventID)
  return events[eventID]
}

app.use("/", express.static("public"))

app.get("/", (req, res)=>{
  twing.render("main.html").then(out=>res.send(out))
})

app.get("/t/:teamNumber", async (req, res)=>{
  let teamNumber = req.params.teamNumber
  const teamData = await api.getTeamWithString(teamNumber)
  if (!teamData) return res.status(404).send(`No team found with number ${teamNumber}`)
  twing.render("eventSelector.html", { teamID: teamData.id }).then(out=>res.send(out))
})

app.get(`/getTeamEvents/:teamID`, async(req, res)=>{
  let teamID = req.params.teamID
  let events = await api.getTeamEvents(teamID)
  res.send(events)
})

app.get("/times/:eventID/:teamID", async (req, res)=>{
  let teamID = req.params.teamID
  const teamData = await api.getTeam(teamID)
  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`)
  console.log(teamData)
  twing.render("times.html", {teamNumber: teamData.number }).then(out=>res.send(out))
})

app.get("/getTeams/:eventID", async (req, res)=>{
  let eventID = req.params.eventID
  // TODO: Remove teamID and just make the cache sort it
  res.send(await api.getMatches(eventID, 1))
})

app.get('/team/:eventID/:teamID', async (req, res) => {
  let teamID = req.params.teamID
  const teamData = await api.getTeam(teamID)
  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`)
  console.log(teamData)
  twing.render("team.html", {teamNumber: teamData.number }).then(out=>res.send(out))
});

app.get("/data/team/:eventID/:teamID", async (req, res)=>{
  let eventID = req.params.eventID
  let teamID = req.params.teamID
  let imgMode = req.query.picture ?? teamID.includes(".png")
  teamID = teamID.replace(".png","")
  const eventDataAPI = await api.getEventWithID(eventID)
  if (!eventDataAPI) return res.status(404).send(`No event found with ID ${eventID}`)
  const teamDataAPI = await api.getTeam(teamID)
  if (!teamDataAPI) return res.status(404).send(`No team found with ID ${teamID}`)

  let event = await getEvent(eventID)
  let teamData = await event.getTeamData(teamID)
  if (imgMode) {
    let img = teamData?.picture
    if (!img) return res.send("No Picture!")
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
    return
  }
  if (teamData) teamData.picture = `http://${req.headers.host}${req.originalUrl}?picture=true`
  res.send(teamData ?? {})
})



const upload = multer()

app.post("/upload/:eventID/:teamID", upload.single("file"), async (req, res)=>{
  // req.file.buffer
  let eventID = req.params.eventID
  let teamID = req.params.teamID
  let event = await getEvent(eventID)
  if (req.file && req.file.buffer) {
    await event.updateTeamData(teamID, {
      picture: req.file.buffer,
      teamID: teamID
    })
    res.send("Set picture!")
  }
  if (req.body && req.body.teamID) {
    let data = req.body
    await event.updateTeamData(teamID, data)
    res.send("Updated!")
  }
  
  
})

app.get("/getTeamData/:teamID", async (req, res)=>{
  let teamID = req.params.teamID
  res.send(await api.getTeam(teamID))
})

server.listen(3100, () => {
  console.log('listening on *:3100');
});
//<script src='/socket.io/socket.io.js'></script>