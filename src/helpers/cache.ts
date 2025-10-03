import { BunORM } from "bunorm";

import type { components } from "../../node_modules/robotevents/out/generated/robotevents" // https://tenor.com/lFHZ8oUJv46.gif

interface Program {
    id: number; name: string; code?: string | null | undefined;
}

interface TeamDataCache {
    program: Program,
    location?: components["schemas"]["Location"],
    team_name?: string;
    robot_name?: string;
    organization?: string;
    registered?: boolean;
    grade?: "College" | "High School" | "Middle School" | "Elementary School";
}

interface EventDataCache {
    id: number,
    location: components["schemas"]["Location"],
    name: string,
    program: Program,
    season: components["schemas"]["Season"],
    sku: string,    

    awards_finalized?: boolean,
    divisions: components["schemas"]["Division"],
    end?: string,
    event_type: components["schemas"]["EventType"],
    level: components["schemas"]["EventLevel"],
    locations: Record<string, components["schemas"]["Location"]>,
    ongoing: boolean,
    start?: string
}   

const db = new BunORM("cache.sqlite", {
    tables: {
        teamCache: {
            columns: {
                teamID: {
                    type: "INTEGER"
                },
                teamNumber: {
                    type: "TEXT"
                },
                teamData: {
                    type: "JSON",
                    customDataType: {} as TeamDataCache
                }
            }
        },
        eventCache: {
            columns: {
                eventID: {
                    type: "INTEGER"
                },
                eventData: {
                    type: "JSON",
                    customDataType: {} as EventDataCache
                }
            }
        }
    },
});

export function getTeam(opt: { number?: string, id?: number }) {
    if (opt.id) {
        let teamInfo = db.tables.teamCache.findBy({teamID: opt.id});
        return teamInfo[0]
    }
    if (opt.number) {
        let teamInfo = db.tables.teamCache.findBy({ teamNumber: opt.number });
        return teamInfo[0]
    }
    
    return null;
}

export function addTeam(team: undefined | null | components["schemas"]["Team"]) {
    console.log("Got team data to cache: ",team)
    if (!team) return;
    let alreadyHas = getTeam({id: team.id, number: team.number});
    if (alreadyHas) return alreadyHas;
    return db.tables.teamCache.save({
        teamID: team.id,
        teamNumber: team.number,
        teamData: {
            program: team.program,
            grade: team.grade,
            location: team.location,
            organization: team.organization,
            registered: team.registered,
            robot_name: team.robot_name,
            team_name: team.team_name
        }
    });
}