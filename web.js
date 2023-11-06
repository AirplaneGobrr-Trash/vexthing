// Web.js:
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const {TwingEnvironment, TwingLoaderFilesystem} = require('twing');
let loader = new TwingLoaderFilesystem('./views');
let twing = new TwingEnvironment(loader, {auto_reload: true,cache:false});


module.exports = {
    express, app, http, server, twing
}