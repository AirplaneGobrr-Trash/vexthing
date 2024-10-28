// index.js:
const { app, express, http, io, server } = require('./helpers/web')
const rApi = require("./helpers/robotApi")

app.use("/static", express.static("public"))

app.use("/api", require("./routes/api"))

const config = require("./config.json")
const utils = require('./helpers/utils')

app.get("/", (req, res) => {
  res.render("main", {
    mainTeams: config.mainTeams,
    teams: config.teams
  })
})

app.get("/t/:teamNumber", async (req, res) => {
  let teamNumber = req.params.teamNumber

  const team = await rApi.team(teamNumber)
  console.log(team)
  const teamData = await team.getData()

  if (!teamData) return res.status(404).send(`No team found with number ${teamNumber}`);

  let eventsHTML = ""
  let events = await team.getEvents()
  for (let event of events) {
    let realDate = event.start.split("T").shift().split("-")
    let date = new Date()
    date.setFullYear(realDate[0], realDate[1]-1, realDate[2]) // DO NOT REMOVE
    let today = new Date()
    let locString = `${event.location.address_1}${event.location.address_2 ? ", " + event.location.address_2: ""}, ${event.location.city}, ${event.location.region}, ${event.location.country}`
    eventsHTML += `
    <div class="match">
      <h3>Where:  <a>${locString}</a> <a href="https://www.google.com/maps/search/${locString.replaceAll(" ", "+")}" target="_blank">(Google Maps)</a> <a href="https://maps.apple.com/?address=${locString.replaceAll(" ", "+")}" target="_blank">(Apple Maps)</a></h3>
      <h3>Venue: ${event.location.venue}</h3>
      <h3>When: ${date.toLocaleDateString()} (${Math.round((date.valueOf() - today.valueOf())/1000/60/60/24)} days)</h3>
      <h3>Goto Page: <a href="/times/${event.id}/${event.divisions[0].id}/${teamData.id}">GO!</a>
    </div>
    `
    // TODO: Find the division the team is in
  }

  res.render("eventSelector", {
    teamID: teamData.id,
    teamNumber: teamNumber,
    events: eventsHTML
  })
})

app.get("/times/:eventID/:divID/:teamID/html", async (req, res) => {
  let teamID = req.params.teamID
  let eventID = req.params.eventID
  let divID = req.params.divID

  const team = await rApi.team(teamID)
  const teamData = await team.getData()
  console.log(team, teamData)

  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`);

  let sendingHTML = {
    teamMatches: "",
    matches: "",
    teams: "",
    skills: "",
  }

  let event = await rApi.event(eventID)
  let matchData = await event.getMacthes(divID, 1)
  // console.log(matchData)
  matchData = matchData.sort((a, b) => new Date(a.scheduled ?? a.started) - new Date(b.scheduled ?? b.started))

  let errorHTML = "<h1>It looks like the event hasn't pushed any data for this yet! Has the event started?</h1>"

  if (matchData.length == 0) {
    sendingHTML.matches = errorHTML
    sendingHTML.teamMatches = errorHTML
  }

  let addedTeams = []
  for (let match of matchData) {
    let teamColor = null
    let teamInfo = []

    let redScore = null
    let blueScore = null

    for (let alli of match.alliances) {
      for (let team of alli.teams) {
        // console.log(alli.color, team)
        let teamNumber = team.team.name
        if (team.team.id == teamID) teamColor = alli.color
        if (!addedTeams.find((v) => v.teamID == team.team.id)) {
          addedTeams.push({ teamID: team.team.id, teamNumber: teamNumber })
        }
        teamInfo.push({ teamNumber: teamNumber, teamID: team.team.id, color: alli.color })
        if (alli.color == "red") redScore = alli?.score; else if (alli.color == "blue") blueScore = alli?.score
      }
    }
    let start = new Date(match.scheduled ?? match.started)
    let currDate = new Date()
    let cMin = start.getMinutes()
    let toShift = Number(0)
    let totalShift = cMin + toShift

    start.setMinutes(totalShift)
    let milliUntillMatch = start.valueOf() - currDate.valueOf()

    // console.log(match)
    // console.log("Shifted", start.toLocaleTimeString(), currDate.toLocaleTimeString(), toShift, totalShift)

    let blueHTML = ""
    let redHTML = ""

    for (let team of teamInfo) {
      let html = ""
      if (team.teamID == teamID) {
        html = `<a href="/team/${eventID}/${team.teamID}" style="color:yellow;" target="_blank">${team.teamNumber}</a> `
      } else {
        html += `<a href="/team/${eventID}/${team.teamID}" target="_blank">${team.teamNumber}</a> `
      }
      if (team.color == "blue") {
        blueHTML += html
      } else {
        redHTML += html
      }
    }

    let blueColor = "cyan"
    let redColor = "red"

    let colorHTML = ""
    switch (teamColor) {
      case "blue": colorHTML = `<h2 style="color: ${blueColor};">Team is blue</h2>`; break;
      case "red": colorHTML = `<h2 style="color: ${redColor};">Team is red</h2>`; break;
    }

    if (blueScore > redScore) {
      blueScore = `<a style="color:yellow;">${blueScore}</a>`
    } else {
      redScore = `<a style="color:yellow;">${redScore}</a>`
    }

    const html = `
    <h1>${match.name}</h1>
    ${colorHTML}
    <h2>Field: ${match.field}</h2>
    <p>Time Until (Minutes): ${(milliUntillMatch / 1000) / 60}</p>
    <p>Start time: ${start.toLocaleTimeString()}</p>
    <p><a style="color:${blueColor};">Blue</a>: (${blueScore}) ${blueHTML}</p>
    <p><a style="color:${redColor};">Red</a>: (${redScore}) ${redHTML}</p>
    `
    const divElm = `\n<div class="match${teamColor ? " ourMatch" : ""}">${html}</div>`
    // console.log(divElm)
    if (teamColor) {
      sendingHTML.teamMatches += divElm
    }
    sendingHTML.matches += divElm
  }

  // TODO: Add more of these stoppers
  if (req.query.type == "teamMatches") {
    return res.json(sendingHTML)
  }

  if (addedTeams.length == 0) {
    let teamData = await event.getTeams()
    addedTeams = teamData.map((v) => {
      return { teamID: v.id, teamNumber: v.number }
    })
  }
  addedTeams = addedTeams.sort(utils.teamSort)

  let teamHasData = {}
  for (let teamInfo of addedTeams) {
    let teamID = teamInfo.teamID
    let team = await rApi.team(teamID)
    let teamData = team.getData()
    teamHasData[teamID] = null
    if (!teamData) {
      continue
    }
    let eventStoredData = await utils.getEventData(eventID)
    let teamStoredData = await eventStoredData.getTeamData(teamID)
    if (teamStoredData) {
      let copy = JSON.parse(JSON.stringify(teamStoredData))
      copy.picture = copy.picture ? 1 : 0
      teamHasData[teamID] = copy ?? null
    }
  }

  let ranksData = await event.getRankings(divID, 1)

  for (let team of addedTeams) {
    let color = "red"

    if (teamHasData && teamHasData[team.teamID] != null) color = "lime"
    if (teamHasData && teamHasData[team.teamID] != null && teamHasData[team.teamID].picture == 0) color = "green"
    let rankData = ranksData.find((v => v.team.id == team.teamID))
    let rank = ""
    let extra = ""
    if (rankData && rankData?.length != 0) {
      rank += `${rankData.rank}. `
      extra += `<p>Wins: <u>${rankData.wins}</u> Losses: <u>${rankData.losses}</u> Ties: <u>${rankData.ties}</u></p>`
      extra += `<p>WP: <u>${rankData.wp}</u> AP: <u>${rankData.ap}</u> SP: <u>${rankData.sp}</u></p>`
      extra += `<p>High score: <u>${rankData.high_score}</u> Avg Score: <u>${rankData.average_points}</u> Total: <u>${rankData.total_points}</u></p>`
    }

    sendingHTML.teams += `
    <div id="${team.teamNumber}">
      <h1>
        <a href="/team/${eventID}/${team.teamID}" target="_blank" style="color: ${color};">
          ${rank}${team.teamNumber}
        </a>
      </h1>
      ${extra}
    </div>`
  }

  
  let skills = await event.getSkills(1)

  for (let team of addedTeams) {
    let skillData = skills.filter((v => v.team.id == team.teamID))
    if (skillData && skillData.length == 0) continue

    let score = ""
    let total = 0
    for (let skillRun of skillData) {
        score+=`${skillRun.type == "driver" ? "Driver:" : "Prog:"} ${skillRun.score}, `
        total+=skillRun.score
    }

    sendingHTML.skills += `
    <div id="${team.teamNumber}">
      <h1>
        <a href="/team/${eventID}/${team.teamID}" target="_blank" style="color: green;">
          ${skillData[0].rank}. ${team.teamNumber}: Total: ${total}, ${score}
        </a>
      </h1>
    </div>`
  }

  if (sendingHTML.skills == "") sendingHTML.skills = errorHTML
  res.json(sendingHTML)
})

app.get("/times/:eventID/:divID/:teamID", async (req, res) => {
  let teamID = req.params.teamID

  const team = await rApi.team(teamID)
  const teamData = await team.getData()
  console.log(team, teamData)

  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`);

  res.render("times", {
    teamNumber: teamData.number,
    eventID: req.params.eventID
  })
})

app.get("/teams/:eventID/editor", async (req, res)=>{
  res.render("data")
})

app.get('/team/:eventID/:teamID', async (req, res) => {
  let teamID = req.params.teamID
  let eventID = req.params.eventID

  const team = await rApi.team(teamID)
  const teamData = await team.getData()

  let eventData = await rApi.event(eventID).getData()
  if (!eventData) return res.status(404).send(`No event found with ID ${eventID}`)

  if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`);
  res.render("team", { teamNumber: teamData.number })
});

server.listen(3100, () => {
  console.log('listening on *:3100');
});
//<script src='/socket.io/socket.io.js'></script>