import bunrest from "bunrest";

const app = bunrest();

import { contextAdder } from "./middleware/context";
app.use(contextAdder);

import { staticRouter } from "./router/static";
app.use("/static", staticRouter);

import { teamRoute } from "./router/teams";
app.use("/team", teamRoute);

import { eventRoute } from "./router/event";
app.use("/event", eventRoute);

import { apiRoute } from "./router/api";
app.use("/api", apiRoute);

import { eventAPIRoute } from "./router/api/event";
app.use("/api/event", eventAPIRoute);

import { teamAPIRoute } from "./router/api/team";
app.use("/api/team", teamAPIRoute);

app.get("/", async (req, res) => {
    await res.render("home");
});

app.get("/match", async (req, res) => {
    
    await res.render("api/matches", {
        eventID: 123456,
        divID: 1,
        testing: true,

        matches: [{
            name: "testing",
            field: "6",
            startTime: "2025-09-14T10:30:00",
            blueScore: 10,
            redScore: 15,

            blueTeam: [
                {
                    number: "6627S",
                    ID: 1234,
                    class: "highlight"
                },
                {
                    number: "6627A",
                    ID: 1234
                }
            ],
            redTeam: [
                {
                    number: "6627Y",
                    ID: 1234
                },
                {
                    number: "6627B",
                    ID: 1234
                }
            ]
        },
        {
            name: "testing",
            teamColor: "blue",
            field: "6",
            startTime: "2025-09-15T23:30:00",
            blueScore: 10,
            redScore: 15,

            blueTeam: [
                {
                    number: "6627S",
                    ID: 1234,
                    class: "highlight"
                },
                {
                    number: "6627A",
                    ID: 1234
                }
            ],
            redTeam: [
                {
                    number: "6627Y",
                    ID: 1234
                },
                {
                    number: "6627B",
                    ID: 1234
                }
            ]
        }]
    })
})


const port = 3100;
app.listen(port, () => {
    console.log(`Running on port http://localhost:${port}`);
});
