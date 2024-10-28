let rApi = require("./robotApi")
const database = require("./database")
const fs = require("fs")
let isString = value => typeof value === 'string' || value instanceof String;

class eventData {
    constructor(eventID) {
        this.eventID = eventID
        this.eventDatabase = `event_${this.eventID}`
        this.database = database.table(this.eventDatabase)
        this.database.useNormalKeys(true)
    }

    async create() {
        await this.database.init()
        return true
    }
    async getTeamData(teamID) {
        await this.create()
        return await this.database.get(`teams.${teamID}`)
    }
    /**
     * 
     * @param {Number} teamID Team ID, E.G. 139679
     * @param {Object} putData Data about team
     * @param {String} putData.teamNumber Team Number, E.G. 6627Y
     * @param {Boolean} putData.cata Does the team have a cata?
     * @param {Boolean} putData.push Can the team push?
     * @param {Boolean} putData.wings Does the team have wings?
     * @param {Number} putData.auton What auton does the team have?
     * @param {Number} putData.hang What type of hang does the team have
     * @param {Number} putData.intake What type of intake does the team have?
     * @param {String} putData.notes Extra notes
     * @param {Buffer} putData.picture Picture of robot
     */
    async updateTeamData(teamID, putData) {
        await this.create()
        let ogData = await this.database.get(`teams.${teamID}`)
        await this.database.set(`teams.${teamID}`, {...ogData, ...putData})
    }
}

module.exports = {
    eventData
}