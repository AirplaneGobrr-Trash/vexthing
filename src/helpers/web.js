// Web.js:
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);

const { engine } = require("express-handlebars");
app.engine("handlebars", engine({ defaultLayout: false })); // Disables yucky layouts shit
app.set("view engine", "handlebars");
app.set("views", "./views");

const bp = require("body-parser")
app.use(bp.json({limit: "100mb"}))

const cookie = require("cookie-parser")
app.use(cookie("apgb-vexthing"))

module.exports = {
    express, app, http, server, io
}