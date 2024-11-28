const express = require("express");
const {getEndpoints, getAllTopics, getArticleById, getAllArticles, getCommentsByArticle} = require("./controller");
const app = express()

app.get('/api', getEndpoints)

app.get('/api/topics', getAllTopics)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getAllArticles)

app.get('/api/articles/:article_id/comments', getCommentsByArticle)


app.use( (err, req , res , next)=>{

    if (err.msg && err.status){
        res.status(err.status).send({msg: err.msg})
    } else if(err.code === '42703' || err.code === '22P02'){
        res.status(400).send({msg: "bad request"})
    }
})
module.exports = app;