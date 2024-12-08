const endpointsJson = require("./endpoints.json");
const { getAllTopicsData, getArticleDataById, getAllArticlesData, getCommentData, addComment, updateVotes } = require("./models")

function getEndpoints(req, res, next) {
    res.status(200).send({ endpoints: endpointsJson });
}

function getAllTopics(req, res, next) {
    getAllTopicsData().then((topicsData) => {
        res.status(200).send({ topics: topicsData })
    });
}

function getArticleById(req, res, next) {
    const { params } = req;
    getArticleDataById(params).then((article) => {
        res.status(200).send(article)
    })
    .catch(next);
}

function getAllArticles(req, res, next) {
    getAllArticlesData().then((articlesData) => {
        res.status(200).send({ articles: articlesData })
    })
}

function getCommentsByArticle(req, res, next) {
    const { params } = req;
    getCommentData(params).then((result) => {
        res.status(200).send({ comments: result })
    }).catch(next);
}

function postCommentByArticle(req, res) {
    const comment = req.body;
    const { article_id } = req.params
    addComment(comment, article_id).then((data) => {
        res.status(201).send(data)
    });
}

function patchArticle(req, res, next) {
    const { article_id } = req.params;
    const inc_votes = req.body.inc_votes;
    updateVotes(inc_votes, article_id).then((data) =>{
        getArticleById(req, res, next);
    }).catch(next)
}
module.exports = { getEndpoints, getAllTopics, getArticleById, getAllArticles, getCommentsByArticle, postCommentByArticle, patchArticle };
