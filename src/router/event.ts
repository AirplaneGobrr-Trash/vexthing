import bunrest from "bunrest";
import { getEvent, getTeam } from "../helpers/robotevents";

export const eventRoute = bunrest().router();

eventRoute.get("/:id", async (req, res) => {
    let eventID = req.params?.id as number;
    console.log(req.originalUrl)
    const url = new URL(req.originalUrl);

    let teamID = "";

    if (url.searchParams.has("team")) {
        teamID = url.searchParams.get("team") as string;
    }

    let event = getEvent(eventID);
    await event.getData();
    console.log(event)

    await res.render("event_viewer", {
        name: event.data.name,
        eventID: eventID,
        teamIDSearch: teamID != "" ? `?team=${teamID}` : "",
        divs: [
            {
                name: "Default",
                id: 1
            }
        ]
    });
});

eventRoute.get("/:id/:divID", async (req, res) => {
    let eventID = req.params?.id as number;
    let divID = req.params?.divID as number;

    console.log(req.originalUrl)
    const url = new URL(req.originalUrl);

    let teamID: number = 0;
    let sisterTeam: string = "";

    if (url.searchParams.has("team")) {
        teamID = Number(url.searchParams.get("team") as string) as number;

        sisterTeam = (await getTeam(teamID).getData()).number.slice(0,-1);
    }

    let event = getEvent(eventID);
    let ed = await event.getData();
    const matches = await event.getMacthes(divID);

    if (!matches) return res.send("No matches bozo");

    const customRoundOrder = [
        1, // I have no clue what round: 1 is, never have seen it (yet.), I think it might be the test match in the VEX Tournament Manager?
        2, // Qualifiers
        6, // R16
        3, // QF
        4, // SF
        5 // F
    ];

    matches.sort((a, b) => {
        // Compare by custom round order first
        const roundDiff = customRoundOrder.indexOf(a.round) - customRoundOrder.indexOf(b.round);
        if (roundDiff !== 0) return roundDiff;

        // If rounds are the same, compare by instance (used in R16, QF, SF, and F)
        const instanceDiff = a.instance - b.instance;
        if (instanceDiff !== 0) return instanceDiff;

        // If instances are also the same, compare by matchnum (only used in Qualifiers it looks like)
        return a.matchnum - b.matchnum;
    })

    let ownMatches = [];
    let matchesSend = [];

    for (let match of matches) {
        let blueTeamD = match.alliance("blue");
        let redTeamD = match.alliance("red");

        let blueTeam = [];
        let redTeam = [];
        let teamColor: boolean|string = false;
        let sisterColor = "";
        let hasSister = false;

        function getInfo(color: "blue" | "red") {
            //@ts-ignore - it does. it is.
            let teamsData = match.alliance(color);

            let teamsOut = [];

            for (let teamDataRaw of teamsData.teams) {
                let teamData = teamDataRaw.team
                let hasTeam = teamData?.id == teamID;
                let isSister = teamData?.name.includes(sisterTeam)
                if (hasTeam) teamColor = color;
                if (isSister) {
                    hasSister = true;
                    sisterColor = color
                }
                teamsOut.push({
                    number: teamData?.name,
                    ID: teamData?.id,
                    class: hasTeam ? "highlight" : `${isSister ? "sisterTeam" : ""}`
                })
            }

            return teamsOut;
        }

        blueTeam = getInfo("blue");
        redTeam = getInfo("red");

        let sendColor: string | boolean = teamColor;
        if (!sendColor || sendColor == "") sendColor = sisterColor

        let matchInfo = {
            name: match.name,
            field: match.field,
            startTime: match.scheduled,
            blueScore: blueTeamD.score,
            redScore: redTeamD.score,

            blueTeam: blueTeam,
            redTeam: redTeam,
            own: !!teamColor,
            sisterOwn: hasSister,
            teamColor: sendColor
        }

        matchesSend.push(matchInfo);
        if (!!teamColor) ownMatches.push(matchInfo)
    }

    await res.render("event_matches", {
        matchesHTML: await res.renderRaw("api/matches", {
            eventID: eventID,
            divID: divID,

            matches: matchesSend
        }),
        ownMatchesHTML: await res.renderRaw("api/matches", {
            eventID: eventID,
            divID: divID,

            matches: ownMatches
        })
    });
});