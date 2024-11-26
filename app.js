const express = require("express");
const {getEndpoints, getAllTopics, getArticleById} = require("./controller");
const app = express()

app.get('/api', getEndpoints)

app.get('/api/topics', getAllTopics)

app.get('/api/articles/:article_id', getArticleById)


app.use( (err, req , res , next)=>{

    if (err.msg && err.status){
        res.status(err.status).send({msg: err.msg})
    } else if(err.code === '42703'){
        res.status(404).send({msg: "bad request"})
    }
})
module.exports = app;