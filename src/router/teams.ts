import bunrest from "bunrest"
import config from "../config.json"
import { getTeam } from "../helpers/robotevents";

export const teamRoute = bunrest().router();

teamRoute.get("/", async (req, res)=>{
    await res.render("teams", {
        mainTeams: config.mainTeams,
        teams: config.teams
    });
});

function isTodayOrFuture(date: Date) {
  const now = new Date();
  // Normalize both to midnight to only compare dates (ignores time of day)
  const given = new Date(date);
  
  now.setHours(0, 0, 0, 0);
  given.setHours(0, 0, 0, 0);

  return given.getTime() >= now.getTime();
}

function daysUntil(date: Date) {
  const now = new Date();
  const target = new Date(date);

  // Normalize both dates to midnight (ignore hours/mins/secs)
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

teamRoute.get("/:teamNumber", async (req, res)=>{
    let teamNumber = req.params?.teamNumber as string;

    let team = getTeam(teamNumber);
    await team.getData();

    let events = await team.getEvents();
    if (!events) return res.send("Oh no-");

    let eventsSend = [];

    for (let event of events) {
        let start = new Date(event.start as string);

        let locString = `${event.location.address_1}${event.location.address_2 ? ", " + event.location.address_2 : ""}, ${event.location.city}, ${event.location.region}, ${event.location.country}`

        eventsSend.push({
            name: event.name,
            locString: locString,
            locStringServices: locString.replaceAll(" ", "+"),
            date: start.toLocaleDateString(),
            countDown: daysUntil(start),
            eventID: event.id,
            comingUp: isTodayOrFuture(start)
        })
    }

    await res.render("team_events", {
        teamNumber: teamNumber,
        teamID: team.id,
        events: eventsSend
    })
})