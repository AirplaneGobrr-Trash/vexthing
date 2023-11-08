const dataHelper = require("./dataHelper")
const fs = require("fs")

async function m(){
    let event = new dataHelper.event("53579")
    await event.updateTeamData("139679", {
        teamNumber: "6627Y",
        cata: true,
        push: true,
        wings: false,
        auton: 1,
        hang: 1,
        intake: 1,
        notes: "This team sucks low key.\nThis team looks good!",
        // picture: fs.readFileSync("test.png")
    })
}
m()