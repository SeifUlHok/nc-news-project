const endpointsJson = require("./endpoints.json");
const {getAllTopicsData, getArticleDataById} = require("./models")

function getEndpoints(req, res, next){
    res.status(200).send({endpoints: endpointsJson});
}

function getAllTopics(req, res, next){
    getAllTopicsData().then((topicsData) =>{
        res.status(200).send({topics:topicsData})
    });
}

function getArticleById(req, res, next){
    const {params} = req;
    getArticleDataById(params).then((article)=>{
        res.status(200).send(article[0])
    })
    .catch(next);
}
module.exports = {getEndpoints, getAllTopics, getArticleById};
