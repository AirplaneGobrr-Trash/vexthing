// index.js:
const { app, express, http, io, server } = require('./helpers/web')
const rApi = require("./helpers/robotApi")

app.use("/static", express.static("public"))

app.use("/api", require("./routes/api"))

app.use("/event", require("./routes/event"))

app.use("/team", require("./routes/team"))

const utils = require('./helpers/utils')
const db = require("./helpers/database")
const users_db = db.table("users")

const crypto = require("node:crypto")

app.use(async (req, res, next) => {
  if (!req.cookies?.id) res.cookie("sid", crypto.randomUUID());

  let users = await users_db.get("users") ?? []
  let user = users.find(obj => obj.sessions.some(session => session.sid == req.cookies.sid));
  req.user = user;

  if (user) {
    let cs = user.sessions.find(v => v.sid == req.cookies.sid)
    if (cs) cs.last = new Date().valueOf()
  }

  next();
})

app.get("/", (req, res) => {
  res.render("main")
})

// These are left in to support old URLs, 50/50 if it works tho...
app.get("/times/:eventID/:divID/:teamID/html", (req, res)=>{
  res.redirect(`/event/${req.params.eventID}/${req.params.divID}/html?team=${req.params.teamID}`)
})

app.get("/times/:eventID/:divID/:teamID", (req, res) => {
  res.redirect(`/event/${req.params.eventID}/${req.params.divID}?team=${req.params.teamID}`)
})

app.get("/team/:eventID/:teamID", (req, res)=>{
  res.redirect(`/event/${req.params.eventID}/team/${req.params.teamID}`)
})

app.get('/team/:eventID/:teamID', async (req, res) => {
  res.redirect(`/event/${req.params.eventID}/team/${req.params.teamID}`)
})

app.get("/teams/:eventID/editor", async (req, res) => {
  res.redirect(`/event/${req.params.eventID}/team/editor`)
})

io.on("connection", (socket) => {
  console.log("User connected!")

  socket.on("update", async (data) => {
    console.log(data)

    if ("eventID" in data && "teamID" in data && "update" in data) {
      let eventID = data.eventID
      let teamID = data.teamID

      let event = await utils.getEventData(eventID)
      const teamData = await (await rApi.team(teamID)).getData()

      await event.updateTeamData(teamID, {
        teamNumber: teamData.number,
        ...data.update
      })
    }

    io.emit("update", data)
  })
})

server.listen(3100, () => {
  console.log('listening on *:3100');
});

//<script src='/socket.io/socket.io.js'></script>