const database = require("./database")
const rApi = require("./robotApi")
const path = require("path")
const fs = require("fs")
const { QuickDB } = require("quick.db");

const dataPath = path.join(__dirname, "..", "data")
fs.mkdirSync("data", { recursive: true })

class eventData {
    constructor(eventID, userID) {
        this.eventID = eventID
        this.userID = userID
        this.lastUsed = new Date()
    }

    async close() {
        this.database = null
    }

    async check() {
        let event = await rApi.event(this.eventID)
        let eventInfo = await event.getData()
        let seasonID = (eventInfo.season.id).toString()

        fs.mkdirSync(path.join(dataPath, seasonID), {recursive: true})

        let db = new QuickDB({
            filePath: path.join(dataPath, `${seasonID}/${this.eventID}.sqlite`)
        })
        db.useNormalKeys(true)
        this.database = db.table(this.userID)

        // TODO: Transfer old data
        // let checkDB = database.table(`event_${this.eventID}`)
        // checkDB.useNormalKeys(true)
        // console.log("checkDB", checkDB)
        // for (let old of await checkDB.all()) {
        //     console.log("old", old)
        // }
    }

    async create() {
        await this.database.init()
        this.lastUsed = new Date()
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
        await this.database.set(`teams.${teamID}`, { ...ogData, ...putData })
    }
}

module.exports = {
    eventData
}