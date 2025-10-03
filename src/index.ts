import bunrest from "@airplanegobrr/bunrest";

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

app.get("/entry", (req, res) => {
    res.send("WIP")
});

const port = 3100;
app.listen(port, () => {
    console.log(`Running on port http://localhost:${port}`);
});
