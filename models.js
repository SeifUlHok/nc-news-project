const db = require("./db/connection");

function getAllTopicsData() {
    return db.query("SELECT * FROM topics")
    .then(({rows}) => {
        return rows;
    })
}



module.exports = {getAllTopicsData};