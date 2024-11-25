
const endpointsJson = require("./endpoints.json");

function getEndpoints(req, res, next){
        res.status(200).send({endpoints: endpointsJson});
}


module.exports = {getEndpoints};
