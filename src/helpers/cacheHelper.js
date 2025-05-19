const database = require("./database")
const table = database.table("cache")

async function rAPI_findCache(url) {
    return await table.get(url)
}

async function rAPI_updateCache(url, data) {

    await table.set(url, { url: url, created: new Date(), data: data })
}


module.exports = {
    find: rAPI_findCache,
    update: rAPI_updateCache    
}