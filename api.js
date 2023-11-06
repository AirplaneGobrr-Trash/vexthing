const axios = require("axios")
const apiKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiNzEwZmU4Mzk1YTg0N2EyNmFlYTA5Mjg1OThhNTk1Y2NhNzIxZDI2NzhhYWRjMzU4NDA4YWZlOTk0ODY0YTM0MWIyNzUwNDI0ZmM3YzdkNmMiLCJpYXQiOjE2OTkxMTE2NzcuMTQwMTc2MSwibmJmIjoxNjk5MTExNjc3LjE0MDE4MDEsImV4cCI6MjY0NTg4NjQ3Ny4xMzM0MDI4LCJzdWIiOiI5NDY2MCIsInNjb3BlcyI6W119.hiFdY6riz5q0OB4Nc06_ScyD3-I5ZQUbc7G1cdt0_NUMnTPH1JdRgncUf036y7SioYhh8uIqM176tTAHiajljhlIg2CciJ-_u1_wbbv6GyL8Irm-aoQPzcixpdN_bwcywDzV8zGnZpePosCEnUwIRRAMy52tdoGRbAUsox35sJehfKRDDcET5qhjKKQ-AHjiIG5sJfpA-ACti4I_XRTY4tdVP-1-K0jPFdn2vm1yX1GFhvTeUkLNjZuPBbag6q4Auldd0lYOpl2jvMALr1AQRU26fpdwpI9-CzA1_TfVf0aj5kO4SYvFJuUSWT9ptTKUEH13z8isijrnWAjYnaSm1rjW2sPDniaR15LW-jKEuqPBimyhxRRBOHGzads7Hhu_H4eo124jz4gXKNCBCiM5BUvUbIdj50Ina0DRaP-qfsOo-NM7Vv93CC7HsoItBd8h7xS_VX3CTSr2z4RsIjAt9adgXxBi9X0GaWercyGIwPunF9vqjM-Zi7HNcCvw9hu9DmA59RAQRltOS_zBcTB-0VjSVrv1tEWKsEX_cgpqG9l8SXtHkXJHJ_nMhrf6-kHraY1jeTg1h-svNdrVruFRN0WpHNOaKKqWIFuQ6o_Mrz3J0JC-q4FBXqGxX94IZXl-2JvoT97nn7j95DiAY1xu_WFvkvSGbtjEtRFcd0vUrrw"
const eApi = new axios.Axios({baseURL: "https://www.robotevents.com/api/v2/", headers: {
    Authorization: `Bearer ${apiKey}`
}})

async function getTeamWithString(teamNumber) {
    let dataRaw = await eApi.get(`/teams?number=${teamNumber}`)
    let data = JSON.parse(dataRaw.data)
    if (data.meta.total != 1) {
        return null
    }
    return data.data[0]
}

async function getTeam(teamID) {
    let dataRaw = await eApi.get(`/teams/${teamID}`)
    let data = JSON.parse(dataRaw.data)
    console.log(data)
    return data
}

async function getTeamEvents(teamID) {
    let startDate = new Date()
    startDate.setMonth(3, 1)
    let dataRaw = await eApi.get(`https://www.robotevents.com/api/v2/events?team=${teamID}&start=${startDate?.toDateString()}&per_page=100`)
    console.log(dataRaw.data)
    const data = JSON.parse(dataRaw.data)
    console.log(data)
    // if (data.meta.total != 1) {
    //     return null
    // }
    return data.data
}

async function getEventWithID(eventID) {
    let dataRaw = await eApi.get(`/events/${eventID}/`)
    let data = JSON.parse(dataRaw.data)
    console.log(data)
    return data
}

async function getMatches(eventID, divID = 1, teams = [], page = 1) {
    let dataRaw = await eApi.get(`/events/${eventID}/divisions/${divID}/matches?team=${teams}&page=${page}`)
    let data = JSON.parse(dataRaw.data)
    console.log(data)
    return data.data
}

// 6627Y = 139679
// currentEvent = 53579

async function main(){
    let e = await getMatches(53579, 1, [139679])
    for (let team of e[0].alliances) {
        console.log(team, team.teams)
    }
}

module.exports = {
    getTeamWithString,
    getMatches,
    getEventWithID,
    getTeam,
    getTeamEvents
}