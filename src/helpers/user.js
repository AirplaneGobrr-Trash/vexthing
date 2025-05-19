const crypto = require("node:crypto")
const db = require("./database")

const users_db = db.table("users")

async function getUser(sid) {
    let users = await users_db.get("users") ?? []
    let user = users.find(obj => obj.sessions.some(session => session.sid == sid));
    return user
}

async function fillUser(req, res, next) {
    if (!req.cookies?.sid) res.cookie("sid", crypto.randomUUID());

    let users = await users_db.get("users") ?? []
    let user = users.find(obj => obj.sessions.some(session => session.sid == req.cookies.sid));
    req.user = user;

    if (user) {
        let cs = user.sessions.find(v => v.sid == req.cookies.sid)
        if (cs) cs.last = new Date().valueOf()
    }

    // If you are the 1 user that some how gets overwriten by this then
    await users_db.set("users", users)
    // I'm sorry?

    return next();
}

async function needLogin(req, res, next) {
    req.userID = "def";
    // return next()
    await fillUser(req, res, ()=>{})
    if (!req?.user) return res.send("need login.")
    console.log("loginCheck", req.user)
    req.userID = req?.user?.id
    return next()
}

function validLogin(req) {
    return !!req?.user
}

module.exports = {
    fillUser,
    needLogin,
    validLogin,
    getUser
}