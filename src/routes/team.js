const router = require("express").Router()
const rApi = require("../helpers/robotApi")
const utils = require("../helpers/utils")
const config = require("../config.json")


router.get("/", (req,res)=>{
    res.render("team_search", {
        mainTeams: config.mainTeams,
        teams: config.teams
    })
})

router.get("/:teamNumber", async (req, res) => {
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
        date.setFullYear(realDate[0], realDate[1] - 1, realDate[2]) // DO NOT REMOVE
        let today = new Date()
        let locString = `${event.location.address_1}${event.location.address_2 ? ", " + event.location.address_2 : ""}, ${event.location.city}, ${event.location.region}, ${event.location.country}`
        eventsHTML += `
      <div class="match">
        <h2>${event.name}</h2>
        <h3>Where: <a>${locString}</a> <a href="https://www.google.com/maps/search/${locString.replaceAll(" ", "+")}" target="_blank">(Google Maps)</a> <a href="https://maps.apple.com/?address=${locString.replaceAll(" ", "+")}" target="_blank">(Apple Maps)</a></h3>
        <h3>Venue: ${event.location.venue}</h3>
        <h3>When: ${date.toLocaleDateString()} (${Math.round((date.valueOf() - today.valueOf()) / 1000 / 60 / 60 / 24)} days)</h3>
        <h3>Goto Page: <a href="/event/${event.id}/?team=${teamData.id}">GO!</a>
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

module.exports = router