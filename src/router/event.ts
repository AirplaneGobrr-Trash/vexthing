import bunrest from "@airplanegobrr/bunrest";
import { getEvent, getTeam } from "../helpers/robotevents";

export const eventRoute = bunrest().router();

eventRoute.get("/:id/team/:teamID", async (req, res)=>{
    let eventID = req.params?.id as number;
    let teamID = req.params?.teamID as number;
    let divID = req.query?.div as number;

    res.send(`WIP! Sorry... ${eventID} - ${divID} - ${teamID}`)
})

eventRoute.get("/:id", async (req, res) => {
    let eventID = req.params?.id as number;
    const url = new URL(req.originalUrl);

    let teamID = "";

    if (url.searchParams.has("team")) {
        teamID = url.searchParams.get("team") as string;
    }

    let event = getEvent(eventID);
    await event.getData();

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

    const url = new URL(req.originalUrl);

    let teamID: number = 0;
    let sisterTeam: string = "";

    if (url.searchParams.has("team")) {
        teamID = Number(url.searchParams.get("team") as string) as number;

        let team = getTeam(teamID);
        await team.getData();

        let sisTeam = team?.number?.slice(0, -1);

        if (sisTeam) sisterTeam = sisTeam;
    }

    let event = getEvent(eventID);
    await event.getData();

    // -- Matches Info --

    const matches = await event.getMacthes(divID);

    let ownMatches = [];
    let matchesSend = [];

    if (matches && matches.length != 0) {

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



        for (let match of matches) {
            let blueTeamD = match.alliance("blue");
            let redTeamD = match.alliance("red");

            let blueTeam = [];
            let redTeam = [];
            let teamColor: boolean | string = false;
            let sisterColor = "";
            let hasSister = false;

            function getInfo(color: "blue" | "red") {
                //@ts-ignore - it does. it is.
                let teamsData = match.alliance(color);

                let teamsOut = [];

                for (let teamDataRaw of teamsData.teams) {
                    let teamData = teamDataRaw.team
                    let hasTeam = teamData?.id == teamID;
                    let isSister = false;
                    if (sisterTeam != "") isSister = !!teamData?.name.includes(sisterTeam)
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
    }


    // -- Ranking info --

    const rankings = await event.getRankings(divID);
    let rankingData = []

    if (rankings && rankings.length != 0) {
        rankings.sort((a, b) => {
            if (!(a.rank && b.rank)) return -1
            return a?.rank - b?.rank
        });

        for (let rank of rankings) {

            let isSister = false;
            let isOwn = false;

            if (teamID === rank.team?.id) isOwn = true;
            if (sisterTeam != "") isSister = !!rank.team?.name.includes(sisterTeam);

            rankingData.push({
                teamNumber: rank.team?.name,
                teamID: rank.team?.id,

                hasRank: true,
                isSister: isSister,
                isOwn: isOwn,

                rank: rank.rank,
                wins: rank.wins,
                losses: rank.losses,
                ties: rank.ties,
                wp: rank.wp,
                ap: rank.ap,
                sp: rank.sp,
                high_score: rank.high_score,
                average_points: rank.average_points,
                total_points: rank.total_points,

                dataHas: false,
                dataHasPicture: false
            });
        }
    } else {
        const teams = await event.getTeams();
        if (teams) {
            for (let team of teams) {
                rankingData.push({
                    teamNumber: team.number,
                    teamID: team.id,

                    hasRank: false,

                    dataHas: false,
                    dataHasPicture: false
                })
            }
        }
    }

    // Skills Info

    const skills = await event.getSkills();
    let skillsData = [];

    if (skills && skills.length != 0) for (let team of rankingData) {
        const skillsInfo = skills.filter(v => v.team?.id === team.teamID);
        if (skillsInfo.length == 0) continue;

        let dSkills = skillsInfo.find(v => v.type == "driver");
        let pSkills = skillsInfo.find(v => v.type == "programming");

        let isOwn = team.teamID === teamID
        let isSister = false
        if (sisterTeam) isSister = !!team.teamNumber?.includes(sisterTeam)

        skillsData.push({
            teamNumber: team.teamNumber,
            teamID: team.teamID,

            overallRank: dSkills?.rank ?? pSkills?.rank,
            total: (pSkills?.score ?? 0) + (dSkills?.score ?? 0),

            isOwn: isOwn,
            isSister: isSister,

            driverRank: 0,
            driverScore: dSkills?.score,
            driverAttempts: dSkills?.attempts,

            progRank: 0,
            progScore: pSkills?.score,
            progAttempts: pSkills?.attempts
        })
    }

    // Sort by top totals
    skillsData.sort((a, b) => b.total - a.total);

    // === Rank Driver ===
    let driverRankings = skillsData
        .filter(t => (t.driverScore != null) && ((t.driverAttempts ?? 0) > 0)) // attempts must be > 0
        .sort((a, b) => (b.driverScore ?? 0) - (a.driverScore ?? 0));

    driverRankings.forEach((team, i) => {
        team.driverRank = i + 1;
    });

    // === Rank Programming ===
    let progRankings = skillsData
        .filter(t => (t.progScore != null) && ((t.progAttempts ?? 0) > 0)) // attempts must be > 0
        .sort((a, b) => (b.progScore ?? 0) - (a.progScore ?? 0));

    progRankings.forEach((team, i) => {
        team.progRank = i + 1;
    });

    // -- Render --
    res.locals = {
        eventID: eventID.toString(),
        divID: divID.toString()
    }

    await res.render("event_matches", {
        matchesHTML: await res.renderRaw("api/matches", {
            matches: matchesSend
        }),
        ownMatchesHTML: await res.renderRaw("api/matches", {
            matches: ownMatches
        }),
        rankingHTML: await res.renderRaw("api/ranking", {
            rankings: rankingData
        }),
        skillsHTML: await res.renderRaw("api/skills", {
            skills: skillsData
        })
    });
});