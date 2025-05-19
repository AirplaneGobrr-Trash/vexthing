// index.js:
const { app, express, http, io, server } = require('./helpers/web')
const rApi = require("./helpers/robotApi")
const config = require("./config.json")
const user = require("./helpers/user")

const crypto = require("node:crypto")
const cookieP = require("cookie")
const bcrypt = require("bcrypt")

const utils = require('./helpers/utils')
const db = require("./helpers/database")
const users_db = db.table("users")

app.use("/static", express.static("public"))

app.use("/api", require("./routes/api"))
app.use("/event", require("./routes/event"))
app.use("/team", require("./routes/team"))

app.use(user.fillUser);

app.get("/user", (req,res)=>{
  res.render("user", {
    username: req?.user?.username,
    userID: req?.user?.id
  })
})

app.get("/sid", (req,res)=>{
  res.json({
    sid: req.cookies["sid"]
  })
})

async function logout(sid) {
  let users = await users_db.get("users") ?? []
  let user = users.find(obj => obj.sessions.some(session => session.sid == sid));
  user.sessions = user.sessions.filter(v => v.sid != sid)
  await users_db.set("users", users)
  return true
}

app.get("/logout", async (req,res)=>{
  if (!req.user) res.send("No!")
  res.send(await logout(req.cookies["sid"]))
})

app.get("/logout/:sid", async (req,res)=>{
  if (!req.user) res.send("No!")
  res.send(await logout(req.params.sid))
})

app.get("/user/data", (req,res)=>{
  res.json(req.user || {})
})

app.get("/entry", (req,res)=>{
  res.render("entry")
})

app.post("/entry", async (req, res) => {
  let data = req.body;
  let users = await users_db.get("users") ?? [];
  console.log(users);

  let user = users.find(v => v.username == data.username);
  console.log(user);

  switch (data.type) {
    case "login": {
      if (!user) return res.json({ good: false });
      let good = bcrypt.compareSync(data.password, user.password);
      if (!good) return res.json({ good: false });
      if (user.sessions.find(v => v.sid == req.cookies["sid"])) {
        return res.json({
          good: true,
          userID: user.id
        });
      }

      if (config.admins.includes(data.username)) user.type = 99
      

      user.sessions.push({ sid: req.cookies["sid"], last: new Date().valueOf() });
      console.log(users);
      await users_db.set("users", users)
      return res.json({
        good: true,
        userID: user.id
      });
      break
    }
    case "signup": {
      if (user) return res.json({ good: false });
      let hash = bcrypt.hashSync(data.password, config.saltRounds);
      let userID = crypto.randomUUID().split("-").pop();

      let type = 0
      if (config.admins.includes(data.username)) type = 99

      users.push({
        username: data.username,
        id: userID,
        password: hash,
        type: type,
        sessions: [
          { sid: req.cookies["sid"], last: new Date().valueOf() }
        ]
      });

      await users_db.set("users", users)
      return res.json({
        good: true,
        userID: userID
      });
      break
    }
    default: {
      break
    }
  }
  res.json({ good: false })
});

app.get("/", (req, res) => {
  console.log("user",req.user)
  res.render("main")
})

// These are left in to support old URLs, 50/50 if it works tho...
app.get("/times/:eventID/:divID/:teamID/html", (req, res) => {
  res.redirect(`/event/${req.params.eventID}/${req.params.divID}/html?team=${req.params.teamID}`)
})

app.get("/times/:eventID/:divID/:teamID", (req, res) => {
  res.redirect(`/event/${req.params.eventID}/${req.params.divID}?team=${req.params.teamID}`)
})

app.get("/team/:eventID/:teamID", (req, res) => {
  res.redirect(`/event/${req.params.eventID}/team/${req.params.teamID}`)
})

app.get('/team/:eventID/:teamID', async (req, res) => {
  res.redirect(`/event/${req.params.eventID}/team/${req.params.teamID}`)
})

app.get("/teams/:eventID/editor", async (req, res) => {
  res.redirect(`/event/${req.params.eventID}/team/editor`)
})

io.on("connection", async (socket) => {
  console.log("User connected!")

  let cookiesRaw = socket.handshake.headers.cookie
  let cookies = cookieP.parse(cookiesRaw)

  socket.on("update", async (data) => {
    console.log(data)

    let socketUser = await user.getUser(cookies?.sid)
    if (!socketUser || !socket.id) return
    console.log(socketUser)

    if ("eventID" in data && "teamID" in data && "update" in data) {
      let eventID = data.eventID
      let teamID = data.teamID

      let event = await utils.getEventData(eventID, socketUser.id)
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