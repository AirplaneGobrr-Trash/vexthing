const router = require("express").Router()

const timeAPI = require("./api_Time")
const teamAPI = require("./api_Team")
const eventAPI = require("./api_Event")

router.use("/time", timeAPI)
router.use("/team", teamAPI)
router.use("/event", eventAPI)

module.exports = router