const db = require("./db/connection");
const format = require("pg-format")

function getAllTopicsData() {
    return db.query("SELECT * FROM topics")
    .then(({rows}) => {
        return rows;
    });
}

function getArticleDataById(params){
    const {article_id} = params;

    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({rows}) => {
        if(rows.length === 0){
            return Promise.reject({status:  404, msg: "Article does not exist"})
        }
        return rows[0];
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

function getCommentData(params){
    const {article_id} = params;

    return db.query("SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC", [article_id])
    .then(({rows}) => {
        if(rows.length === 0){
            return Promise.reject({status:  404, msg: "Article does not exist"})
        }
        return rows;
    }).catch((err) =>{
        return Promise.reject(err)
    });
}

function addComment(comment, article_id){
    const arr = [];
    comment.article_id = article_id;

    arr.push(comment)
    const formattedArr = arr.map((data) => {
        const newArr = []
        for(key in data) {
            newArr.push(data[key])
        }
        return newArr;
    });
    
    const checkAuthorQuery = `SELECT * FROM users WHERE username = $1`;
    const insertAuthorQuery = `INSERT INTO users (username, name) VALUES ($1 , $2)`;


    const str = format(`INSERT INTO comments(author, body, article_id ) VALUES %L RETURNING *;`, formattedArr)
    
    
    return db
    .query(checkAuthorQuery, [comment.username])
    .then((result) => {
        if (result.rows.length === 0) {
            return db.query(insertAuthorQuery, [comment.username , comment.username]);
        }
        return Promise.resolve();
    })
    .then(() => {
        return db.query(str);
    })
    .then(({rows}) => {
        return rows[0];
    });
}

function updateVotes(votes,id){
    return db.query(`UPDATE articles SET votes = votes +$1 WHERE article_id =$2 RETURNING *;`,[votes,id])
}
module.exports = {getAllTopicsData, getArticleDataById, getAllArticlesData, getCommentData, addComment, updateVotes};



