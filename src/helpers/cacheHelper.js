const knex = require("./knex")

console.log("knex",knex)

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
    find: rAPI_findCache,
    update: rAPI_updateCache    
}