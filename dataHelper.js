const knex = require('knex')({
    client: 'sqlite3', // or 'better-sqlite3'
    useNullAsDefault: true,
    connection: {
        filename: "./data.sqlite",
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    }
});
const fs = require("fs")

class event {
    constructor(eventID){
        this.eventID = eventID
        this.eventDatabase = `event-${this.eventID}`
    }

    async create() {
        if (!await knex.schema.hasTable(this.eventDatabase)) {
            await knex.schema.createTable(this.eventDatabase, (table)=>{
                table.bigInteger("teamID").primary() // 139679
                table.text("teamNumber") // 6627Y
                table.boolean("intake") // True - False
                table.boolean("push") // True - False
                table.boolean("wings") // True - False
                table.integer("auton") // ["far", "near"]
                table.integer("hang") // ["passive", "break"]
                table.integer("cata") // ["arm", "flywheel", "other"]
                table.text("notes") // Bla bla xyz bla bla
                table.specificType("picture", "LONGBLOB") // <Picture of robot>
            })
            return true
        }
        return false
    }
    async getTeamData(teamID){
        let stat = await this.create()
        console.log("2",stat)
        return await knex(this.eventDatabase).where({ teamID: teamID }).first()
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
        let stat = await this.create()
        console.log("1",stat, putData)
        let data = await this.getTeamData(teamID)
        if (data) {
            console.log("Data found!")
            await knex(this.eventDatabase).where({ teamID: teamID }).update(putData)
        } else {
            console.log("Data not found!")
            putData.teamID = teamID
            await knex(this.eventDatabase).insert(putData)
        }
    }
}

module.exports = {
    event
}