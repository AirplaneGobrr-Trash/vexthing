let rApi = require("./robotApi")
const knex = require("./knex")
const fs = require("fs")
let isString = value => typeof value === 'string' || value instanceof String;

class eventData {
    constructor(eventID) {
        this.eventID = eventID
        this.eventDatabase = `event-${this.eventID}`
    }

    async create() {
        let eventData = await (await rApi.event(this.eventID)).getData()
        let dataRaw = fs.readFileSync(`./layout/${eventData.season.id}.json`)
        let dataLayout = JSON.parse(dataRaw)
        if (!await knex.schema.hasTable(this.eventDatabase)) {
            await knex.schema.createTable(this.eventDatabase, async (table) => {
                table.bigInteger("teamID").primary() // 139679
                table.text("teamNumber") // 6627Y
                table.specificType("picture", "LONGBLOB") // <Picture of robot>

                function add(dataIn, start="") {
                    for (let key in dataIn) {
                        let data = dataIn[key]

                        let dType = typeof data
                        if (isString(data)) dType = data.toLowerCase()

                        switch (dType) {
                            case "boolean": {
                                table.boolean(`${start}${key}`)
                                break
                            }
                            case "string": {
                                table.string(`${start}${key}`, 9999999)
                                break
                            }
                            case "number": {
                                table.integer(`${start}${key}`, 9999999)
                                break
                            }
                            case "object": {
                                add(dataIn[key], `${start}${key}-`)
                                break
                            }
                        }
                    }
                }
                add(dataLayout, "")

                // table.boolean("intake") // True - False
                // table.boolean("push") // True - False
                // table.boolean("wings") // True - False
                // table.integer("auton") // ["far", "near"]
                // table.integer("hang") // ["passive", "break"]
                // table.integer("cata") // ["arm", "flywheel", "other"]
                // table.text("notes") // Bla bla xyz bla bla
            })
            return true
        }
        let cols = await knex.table(this.eventDatabase).columnInfo()

        knex.schema.table(this.eventDatabase, async (table) => {
            let added = []
            for (let key in dataLayout) {
                added.push(key)
                if (cols[key]) {
                    // TODO: Check if this is the right type
                    continue
                }
                let data = dataLayout[key]

                let dType = typeof data
                if (isString(data)) dType = data.toLowerCase()

                console.log("type", key, dType)

                switch (dType) {
                    case "boolean": {
                        table.boolean(key)
                        break
                    }
                    case "string": {
                        table.string(key, 9999999)
                        break
                    }
                    case "object": {
                        table.integer(key)
                        break
                    }
                    case "number": {
                        table.integer(key)
                        break
                    }
                }
            }
            for (let col in cols) {
                if (added.includes(col)) continue
                table.dropColumn(col)
            }
        })

        return false
    }
    async getTeamData(teamID) {
        await this.create()
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
        await this.create()
        let data = await this.getTeamData(teamID)
        if (data) {
            await knex(this.eventDatabase).where({ teamID: teamID }).update(putData)
        } else {
            putData.teamID = teamID
            await knex(this.eventDatabase).insert(putData)
        }
    }
}


async function rAPI_cacheCheck() {
    try {
        if (!await knex.schema.hasTable("cache")) await knex.schema.createTable("cache", (table) => {
            table.text("url")
            table.date("created")
            table.text("data")
        })
    } catch (e) { }
}

async function rAPI_findCache(url) {
    await rAPI_cacheCheck()
    return await knex("cache").where("url", url).first()
}

async function rAPI_updateCache(url, data) {
    await rAPI_cacheCheck()
    await knex("cache").where("url", url).delete()
    await knex("cache").insert({ url: url, created: new Date(), data: data })
}


module.exports = {
    eventData,
    robotAPICache: {
        find: rAPI_findCache,
        update: rAPI_updateCache
    }
}