const axios = require("axios")
// const cache = require("function-cache")
const fs = require("fs")
fs.mkdirSync("tmpData", { recursive: true })
const apiKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiNzEwZmU4Mzk1YTg0N2EyNmFlYTA5Mjg1OThhNTk1Y2NhNzIxZDI2NzhhYWRjMzU4NDA4YWZlOTk0ODY0YTM0MWIyNzUwNDI0ZmM3YzdkNmMiLCJpYXQiOjE2OTkxMTE2NzcuMTQwMTc2MSwibmJmIjoxNjk5MTExNjc3LjE0MDE4MDEsImV4cCI6MjY0NTg4NjQ3Ny4xMzM0MDI4LCJzdWIiOiI5NDY2MCIsInNjb3BlcyI6W119.hiFdY6riz5q0OB4Nc06_ScyD3-I5ZQUbc7G1cdt0_NUMnTPH1JdRgncUf036y7SioYhh8uIqM176tTAHiajljhlIg2CciJ-_u1_wbbv6GyL8Irm-aoQPzcixpdN_bwcywDzV8zGnZpePosCEnUwIRRAMy52tdoGRbAUsox35sJehfKRDDcET5qhjKKQ-AHjiIG5sJfpA-ACti4I_XRTY4tdVP-1-K0jPFdn2vm1yX1GFhvTeUkLNjZuPBbag6q4Auldd0lYOpl2jvMALr1AQRU26fpdwpI9-CzA1_TfVf0aj5kO4SYvFJuUSWT9ptTKUEH13z8isijrnWAjYnaSm1rjW2sPDniaR15LW-jKEuqPBimyhxRRBOHGzads7Hhu_H4eo124jz4gXKNCBCiM5BUvUbIdj50Ina0DRaP-qfsOo-NM7Vv93CC7HsoItBd8h7xS_VX3CTSr2z4RsIjAt9adgXxBi9X0GaWercyGIwPunF9vqjM-Zi7HNcCvw9hu9DmA59RAQRltOS_zBcTB-0VjSVrv1tEWKsEX_cgpqG9l8SXtHkXJHJ_nMhrf6-kHraY1jeTg1h-svNdrVruFRN0WpHNOaKKqWIFuQ6o_Mrz3J0JC-q4FBXqGxX94IZXl-2JvoT97nn7j95DiAY1xu_WFvkvSGbtjEtRFcd0vUrrw"
const eApi = new axios.Axios({baseURL: "https://www.robotevents.com/api/v2/", headers: {
    Authorization: `Bearer ${apiKey}`
}})


/**
 * @typedef metaData
 * @property {Object} meta
 * @property {Number} meta.current_page
 * @property {String} meta.first_page_url
 * @property {Number} meta.from
 * @property {Number} meta.last_page
 * @property {String} meta.last_page_url
 * @property {String} meta.next_page_url
 * @property {String} meta.path
 * @property {Number} meta.per_page
 * @property {String} meta.prev_page_url
 * @property {Number} meta.to
 * @property {Number} meta.total
 */


/**
 * @typedef locations
 * @property {String} venue
 * @property {String} address_1
 * @property {String} address_2
 * @property {String} city
 * @property {String} region
 * @property {String} postcode
 * @property {String} country
 * @property {Object} coordinates
 * @property {Number} coordinates.lat
 * @property {Number} coordinates.lon
 */

/**
 * @typedef Division
 * @property {Number} id
 * @property {String} name
 * @property {Number} order
 */

/**
 * @typedef EventWithID
 * @property {Number} id
 * @property {String} sku
 * @property {String} name
 * @property {String} start
 * @property {String} end
 * @property {Object} season
 * @property {Number} season.id
 * @property {String} season.name
 * @property {String} season.code
 * @property {Object} program
 * @property {Number} program.id
 * @property {String} program.name
 * @property {String} program.code
 * @property {Location} location
 * @property {Array<Object.<string,Location>>} locations
 * @property {Array<Division>} divisions
 * @property {String} level
 * @property {Boolean} ongoing
 * @property {Boolean} awards_finalized
 * @property {String} event_type
 */

const urlCache = []

async function doGet(url){
    console.log("\n[GET REQUEST]", url)
    //console.log("DEBUG", (new Error()));

    let cache = urlCache.find((v)=> v.url == url)
    if (cache) {
        console.log("Sending cached result!")
        return cache.data
    }

    console.log("Uncached URL! Caching!")

    let dataRaw = await eApi.get(url)
    try {
        let data = JSON.parse(dataRaw.data)
        urlCache.push({url: url, created: new Date(), data: data})
        return data
    } catch (e) {
        console.log(e)
        console.log(url)
        fs.writeFileSync("error.html", dataRaw.data)
        return {}
    }
}

class eventC {
    constructor(eventID) {
        this.eventID = eventID
    }
    /**
     * @returns {Promise<EventWithID>}
     */
    async getData() {
        let data = await doGet(`/events/${this.eventID}/`)
        return data
    }
    async getMacthes(divID, page = 1) {
        let data = await doGet(`/events/${this.eventID}/divisions/${divID}/matches?page=${page}`)
        return data.data
    }
    async getTeams(){
        let data = await doGet(`/events/${this.eventID}/teams?per_page=100`)
        return data.data
    }
}

class teamC {
    /**
     * 
     * @param {Object} options 
     * @param {Number} options.teamID
     * @param {String} options.teamNumber
     */
    constructor(options = {}) {
        this.options = options
        this.check()
        this.teamDataCache = null
    }
    async check() {
        let options = this.options
        if (!options.teamID && options.teamNumber) {
            this.teamNumber = options.teamNumber
            let data = await this.getWithNumber(options.teamNumber)
            this.teamID = data?.id
        }
        if (!options.teamNumber && options.teamID) {
            this.teamID = options.teamID
            let data = await this.getWithID(options.teamID)
            this.teamNumber = data?.number
        }
    }
    async getWithNumber(number) {
        if (this.teamDataCache) return this.teamDataCache
        let data = await doGet(`/teams?number=${number}`)
        if (data?.meta?.total != 1 && !data.data[0]) {
            return null
        }
        this.teamDataCache = data.data[0]
        return data.data[0]
    }
    async getWithID(teamID) {
        if (this.teamDataCache) return this.teamDataCache
        let data = await doGet(`/teams/${teamID}`)
        this.teamDataCache = data
        return data
    }
    async getEvents() {
        await this.check()
        let startDate = new Date()
        startDate.setMonth(3, 1)
        let data = await doGet(`/events?team=${this.teamID}&start=${startDate?.toDateString()}&per_page=100`)
        return data.data
    }
    async getData(){
        if (this.data) return this.data
        await this.check()
        this.data = await this.getWithID(this.teamID)
        return this.data
    }
}


let teams = []

/**
 * 
 * @param {String|Number} team 
 * @returns {teamC}
 */
function team(team) {
    let teamID = Number(team)
    if (teamID) {
        // check if team is a thing
        let teamIndex = teams.findIndex((obj => obj.teamID == teamID));

        if (teamIndex == -1) {
            let t = {teamID: teamID, team: new teamC({teamID: teamID})}
            teams.push(t)
            return t.team
        }
        teams[teamIndex].teamID = teamID
        return teams[teamIndex].team
    } else {
        let teamNumber = team

        let teamIndex = teams.findIndex((obj => obj.teamNumber == teamNumber));
        if (teamIndex == -1) {
            let t = {teamNumber: teamNumber, team: new teamC({teamNumber: teamNumber})}
            teams.push(t)
            return t.team
        }
        teams[teamIndex].teamNumber = teamNumber
        return teams[teamIndex].team
    }
}

let events = {}

/**
 * 
 * @param {Number} eventID 
 * @returns {eventC}
 */
function event(eventID) {
    let event = events[eventID]
    if (event) return event
    event = new eventC(eventID)
    return event
}

// 6627Y = 139679
// currentEvent = 53579

module.exports = {
    eventC,
    teamC,
    team,
    event
}