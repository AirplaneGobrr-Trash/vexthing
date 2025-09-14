const router = require("express").Router()
const rApi = require("../helpers/robotApi")
const utils = require("../helpers/utils")

router.get("/", (req, res)=>{
    res.render("event_search")
})

router.get("/:eventID", async (req, res) => {
    let eventID = req.params.eventID
    let event = await rApi.event(eventID)
    let eventData = await event.getData()

    console.log(eventData)

    let teamSearch = ""
    if (req.query.team) {
        teamSearch = `?team=${req.query.team}`
    }

    let divHtml = ""

    if ("divisions" in eventData) for (let div of eventData.divisions) {
        divHtml += `<div>
      <h3><a href="/event/${eventID}/${div.id}${teamSearch}">${div.name}</a></h3>
      </div>`
    }

    res.render("event", {
        eventID: eventID,
        name: eventData.name,
        divHTML: divHtml
    })
})

router.get("/:eventID/:divID/html", async (req, res) => {
    let eventID = req.params.eventID
    let divID = req.params.divID

    let teamIDraw = req.query.team || ""
    let teamData = await rApi.team(teamIDraw)
    await teamData.check()
    let teamID = teamData.teamID
    let mainTeamID = teamData.teamNumber.slice(0, -1);
    console.log("mainTeamID", mainTeamID)
    
    let toShift = Number(req.query.shift) || 0

    let sendingHTML = {
        teamMatches: "",
        matches: "",
        teams: "",
        skills: "",
    }

    let event = await rApi.event(eventID)
    let matchData = await event.getMacthes(divID, 1)
    console.log(matchData)

    // The following is here due to the robotevents api not returning the matches in order
    // A custom sort metod has to be used

    // First we make a "sort round order"
    const customRoundOrder = [
        1, // I have no clue what round: 1 is, never have seen it (yet.), I think it might be the test match in the VEX Tournament Manager?
        2, // Qualifiers
        6, // R16
        3, // QF
        4, // SF
        5 // F
    ];

    matchData = matchData.sort((a, b) => {
        // Compare by custom round order first
        const roundDiff = customRoundOrder.indexOf(a.round) - customRoundOrder.indexOf(b.round);
        if (roundDiff !== 0) return roundDiff;

        // If rounds are the same, compare by instance (used in R16, QF, SF, and F)
        const instanceDiff = a.instance - b.instance;
        if (instanceDiff !== 0) return instanceDiff;

        // If instances are also the same, compare by matchnum (only used in Qualifiers it looks like)
        return a.matchnum - b.matchnum;
    });

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
                html = `<a href="/event/${eventID}/team/${team.teamID}?div=${divID}" style="color:yellow;" target="_blank">${team.teamNumber}</a> `
            } else if (team.teamNumber.includes(mainTeamID)) {
                html = `<a href="/event/${eventID}/team/${team.teamID}?div=${divID}" style="color:pink;" target="_blank">${team.teamNumber}</a> `
            } else {
                html += `<a href="/event/${eventID}/team/${team.teamID}?div=${divID}" target="_blank">${team.teamNumber}</a> `
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

        // Mark winning team with yellow (to make it pop!)
        if (blueScore > redScore) {
            blueScore = `<a style="color:yellow;">${blueScore}</a>`
        } else if (redScore > blueScore) {
            redScore = `<a style="color:yellow;">${redScore}</a>`
        }

        const html = `
      <h1>${match.name}</h1>
      ${colorHTML}
      <h2>Field: ${match.field}</h2>
      <p>Time Until (Minutes): ${((milliUntillMatch / 1000) / 60).toFixed(2)}</p>
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
        let rankData = ranksData?.find((v => v.team.id == team.teamID)) || []
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
          <a href="/event/${eventID}/team/${team.teamID}?div=${divID}" target="_blank" style="color: ${color};">
            ${rank}${team.teamNumber}
          </a>
        </h1>
        ${extra}
      </div>`
    }


    let skills = await event.getSkills(1)

    for (let team of addedTeams) {
        let skillData = skills?.filter((v => v.team.id == team.teamID)) || []
        if (skillData && skillData.length == 0) continue

        let score = ""
        let total = 0
        for (let skillRun of skillData) {
            score += `${skillRun.type == "driver" ? "Driver:" : "Prog:"} ${skillRun.score}, `
            total += skillRun.score
        }

        sendingHTML.skills += `
      <div id="${team.teamNumber}">
        <h1>
          <a href="/event/${eventID}/team/${team.teamID}?div=${divID}" target="_blank" style="color: green;">
            ${skillData[0].rank}. ${team.teamNumber}: Total: ${total}, ${score}
          </a>
        </h1>
      </div>`
    }

    if (sendingHTML.skills == "") sendingHTML.skills = errorHTML
    res.json(sendingHTML)
})

router.get("/:eventID/:divID", async (req, res) => {
    let teamNumber = null
    
    if (req.query.team) {
        // TODO: Make better, yikes bro.
        let teamData = await rApi.team(req.query.team)
        await teamData.check()
        teamNumber = teamData.teamNumber;
    }

    res.render("matches", {
        eventID: req.params.eventID,
        teamNumber: teamNumber
    })
})

router.get("/:eventID/team/:teamID", async (req, res) => {
    let teamID = req.params.teamID
    let eventID = req.params.eventID

    console.log(teamID)
    if (teamID == "editor") {
        return res.render("data")
    }

    const team = await rApi.team(teamID)
    const teamData = await team.getData()

    let eventData = await rApi.event(eventID).getData()
    if (!eventData) return res.status(404).send(`No event found with ID ${eventID}`)

    if (!teamData) return res.status(404).send(`No team found with ID ${teamID}`);
    res.render("team", { teamNumber: teamData.number })
});

module.exports = router