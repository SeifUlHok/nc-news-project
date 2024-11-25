const express = require("express");
const {getEndpoints, getAllTopics} = require("./controller");
const app = express()


app.get('/api', getEndpoints)

app.get('/api/topics', getAllTopics)


module.exports = app;