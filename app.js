const express = require("express");
const {getEndpoints} = require("./controller");
const app = express()

app.use(express.json())

app.get('/api', getEndpoints)

module.exports = app;