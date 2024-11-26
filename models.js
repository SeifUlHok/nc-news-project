const db = require("./db/connection");
const articles = require("./db/data/test-data/articles");

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

function getAllArticlesData(){
    return db.query(`
        SELECT a.author, a.title, a.article_id, a.topic, a.created_at, a.votes, a.article_img_url, COUNT(c.comment_id) AS comment_count
        FROM articles a
        LEFT JOIN comments c ON a.article_id = c.article_id
        GROUP BY a.article_id
        ORDER BY a.created_at DESC;
    `)
    .then(({rows}) => {
        return rows;
    });
}


module.exports = {getAllTopicsData, getArticleDataById, getAllArticlesData};