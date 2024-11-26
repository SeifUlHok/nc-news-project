const db = require("./db/connection");

function getAllTopicsData() {
    return db.query("SELECT * FROM topics")
    .then(({rows}) => {
        return rows;
    });
}

function getArticleDataById(params){
    const {article_id} = params;

    return db.query(`SELECT * FROM articles WHERE article_id = ${article_id}`)
    .then(({rows}) => {
        if(rows.length === 0){
            return Promise.reject({status:  400, msg: "invalid id"})
        }
        return rows;
    }).catch((err)=>{
        return Promise.reject(err)
    });
}



module.exports = {getAllTopicsData, getArticleDataById};