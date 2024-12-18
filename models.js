const db = require("./db/connection");
const format = require("pg-format");

function getAllTopicsData() {
    return db.query("SELECT * FROM topics")
    .then(({rows}) => {
        return rows;
    });
}

function getArticleDataById(params){
    const {article_id} = params;

    return db.query(`  SELECT a.*, COUNT(c.comment_id) AS comment_count
    FROM articles a
    LEFT JOIN comments c ON a.article_id = c.article_id
    WHERE a.article_id = $1
    GROUP BY a.article_id
`, [article_id])
    .then(({rows}) => {
        if(rows.length === 0){
            return Promise.reject({status:  404, msg: "Article does not exist"})
        }
        return rows[0];
    })
}

function getAllArticlesData(sort_by='created_at', order='desc', topic){
    let query = `
        SELECT a.author, a.title, a.article_id, a.topic, a.created_at, a.votes, a.article_img_url, COUNT(c.comment_id) AS comment_count
        FROM articles a
        LEFT JOIN comments c ON a.article_id = c.article_id
    `;

    if (topic) {
        query += ` WHERE a.topic = $1`;
    }

    query += ` GROUP BY a.article_id ORDER BY ${sort_by} ${order};`;

    return db.query(query, topic ? [topic] : [])
        .then(({ rows }) => {
            if(rows.length === 0){
                return Promise.reject({status:  404, msg: "Article does not exist"})
            }
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
    })
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
    return db.query(`UPDATE articles SET votes = votes +$1 WHERE article_id =$2 RETURNING *;`,[votes,id]);
};

function deleteCommentSql(comment_id){
    return db.query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [comment_id]).then(({rows}) =>{
        if(rows.length === 0){
            return Promise.reject({status:  404, msg: "comment not found"})
        }else{
            return rows;
        }
    })
};

function selectUsers(){
    return db.query('SELECT * FROM users;').then(({rows}) =>{
        if(rows.length === 0){
            return Promise.reject({status:  404, msg:'users not found'})
        }
        return rows;
    })
}
module.exports = { selectUsers, getAllTopicsData, getArticleDataById, getAllArticlesData, getCommentData, addComment, updateVotes, deleteCommentSql};



