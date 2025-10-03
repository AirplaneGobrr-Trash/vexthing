import { Client, Event, Team } from "robotevents"
import type { components } from "../../node_modules/robotevents/out/generated/robotevents" // https://tenor.com/lFHZ8oUJv46.gif
import config from "../config.json"

import * as cache from "./cache"

const rAPI = Client({
    authorization: {
        token: config.robotEventsAPI
    }
});

const program = "V5RC";

class C_Team {
    public number?: string;
    public id?: number;
    
    public data?: Team;

    constructor(opt: { number?: string, id?: number }) {
        if (opt.id) this.id = opt.id;
        if (opt.number) this.number = opt.number
        this.check();
    }

    async check(): Promise<Team | undefined> {
        let tDataCache = cache.getTeam({ id: this.id, number: this.number });
        if (tDataCache) {
            this.id = tDataCache?.teamID
            this.number = tDataCache?.teamNumber

            return new Team({
                ...tDataCache.teamData,
                id: tDataCache.teamID,
                number: tDataCache.teamNumber,
            }, rAPI.api);
        }

        // these checks scary af!!

        // Has Number no ID
        if (this.number && !this.id) {
            let fullDataReturned = await rAPI.teams.getByNumber(this.number, rAPI.programs[program]);
            let teamData = fullDataReturned.data;
            if (!teamData) return;

            this.id = teamData.id;
            this.data = teamData;
        }

        // Has ID no Number
        if (!this.number && this.id) {
            let fullDataReturned = await rAPI.teams.get(this.id);
            let teamData = fullDataReturned.data
            if (!teamData) return;

            this.number = teamData.number;
            this.data = teamData;
        }

        if (this.data) cache.addTeam(this.data);

        return this.data;
    }

    async getData(): Promise<Team | undefined> {
        if (this.data && this.data.id != 0) return this.data;
        return await this.check();
    }

    async getEvents(): Promise<Event[] | undefined> {
        let d = await this.getData();
        if (!d) return;
        let events = (await d.events()).data;
        // console.log(events)
        return events;
    }
}

let teams: C_Team[] = [];

export function getTeam(teamSearch: string | number): C_Team {
    let teamID = Number(teamSearch);
    if (teamID) {
        let team = teams.find(v => v.id === teamID);

        if (!team) {
            let t = new C_Team({ id: teamID });
            teams.push(t);
            return t;
        }
        return team;
    }

    let team = teams.find(v => v.number === teamSearch)
    if (!team) {
        let t = new C_Team({ number: teamSearch as string });
        teams.push(t);
        return t;
    }

    return team;
}


class C_Event {
    public id: number = 0;
    // @ts-ignore
    public data: Event;

    constructor(eventID: number) {
        this.id = eventID;
    }

    async check() {
        if (this.data && this.id != 0) return this.data;
        let eData = (await rAPI.events.get(this.id)).data;
        if (!eData) return;
        this.data = eData;
        return this.data;
    }

    async getData(): Promise<Event> {
        if (this.data && this.id != 0) return this.data;
        // @ts-ignore Skill issue
        return await this.check();
    }

    async getMacthes(divID: number) {
        let d = await this.getData();
        let matchesData = (await d.matches(divID)).data

        return matchesData;
    }

    async getSkills() {
        let d = await this.getData();
        let skillsData = (await d.skills()).data

        return skillsData;
    }

    async getTeams() {
        let d = await this.getData();
        let teamsData = (await d.teams()).data

        return teamsData;
    }

    async getRankings(divID: number) {
        let d = await this.getData();
        let rankingsData = (await d.rankings(divID)).data

        return rankingsData;
    }
}

const events: C_Event[] = [];
export function getEvent(eventID: number): C_Event {
    let event = events.find(v => v.id === eventID);
    if (event) return event;

    event = new C_Event(eventID);
    events.push(event);
    return event;
}