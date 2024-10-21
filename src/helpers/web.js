// Web.js:
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { engine } = require("express-handlebars");
app.engine("handlebars", engine({ defaultLayout: false })); // Disables yucky layouts shit
app.set("view engine", "handlebars");
app.set("views", "./views");

const bp = require("body-parser")
app.use(bp.json({limit: "100mb"}))

module.exports = {
    express, app, http, server
}