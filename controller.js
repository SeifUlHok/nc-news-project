
const endpointsJson = require("./endpoints.json");
const topicsJson = require("./db/data/development-data/topics");
const {getAllTopicsData} = require("./models")

function getEndpoints(req, res, next){
    res.status(200).send({endpoints: endpointsJson});
}

function getAllTopics(req, res, next){
    getAllTopicsData().then((rows) =>{
        res.status(200).send({topics:rows})
    });
}
module.exports = {getEndpoints, getAllTopics};
