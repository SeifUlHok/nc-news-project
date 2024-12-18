const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");
const topicData = require("../db/data/test-data/topics")
const userData = require("../db/data/test-data/users")
const articleData = require("../db/data/test-data/articles")
const commentData = require("../db/data/test-data/comments")
const seed = require("../db/seeds/seed");
/* Set up your beforeEach & afterAll functions here */

beforeEach(() => seed({ topicData, userData, articleData, commentData }))

afterAll(() => db.end());

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(Array.isArray(topics)).toBe(true)
        expect(topics.length).toBeGreaterThan(0)
        topics.forEach(function (topic) {
          expect(Array.isArray(topic)).toEqual(false)
          expect(typeof topic).toEqual('object')
        })
      });
  });

  test("200: Each object contains a slug and description ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBeGreaterThan(0)
        topics.forEach(function (topic) {
          expect(topic).toHaveProperty("slug")
          expect(topic).toHaveProperty("description")
        })
      });
  });

});


describe("GET /api/articles/:article_id", () => {
  test("200: return object with correct properties and ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article_id } = body;
        expect(typeof body).toBe('object')
        expect(Array.isArray(body)).toBe(false)
        expect(body).toHaveProperty("author")
        expect(body).toHaveProperty("title")
        expect(body).toHaveProperty("article_id")
        expect(body).toHaveProperty('body')
        expect(body).toHaveProperty('topic')
        expect(body).toHaveProperty('created_at')
        expect(body).toHaveProperty('votes')
        expect(body).toHaveProperty('article_img_url')
        expect(article_id).toBe(1)
      })
  });

  test("400: return 'Article does not exist' message when requesting an id that is not in the database", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Article does not exist')
      })
  });

  test("404: return 'bad request' message when requesting with an invalid input type", () => {
    return request(app)
      .get("/api/articles/asd")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('bad request')
      })
  });

});

describe("GET /api/articles", () => {
  test("200: return an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true)
        expect(articles.length).toBeGreaterThan(0)
        articles.forEach(function (article) {
          expect(Array.isArray(article)).toEqual(false)
          expect(typeof article).toEqual('object')
          expect(article).toHaveProperty("author")
          expect(article).toHaveProperty("title")
          expect(article).toHaveProperty("article_id")
          expect(article).toHaveProperty("topic")
          expect(article).toHaveProperty("created_at")
          expect(article).toHaveProperty("votes")
          expect(article).toHaveProperty("article_img_url")
          expect(article).toHaveProperty("comment_count")
          expect(article).not.toHaveProperty("body")
        })
      })
  });

  test("200: the objects are sorted by created_at key in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        const sortedArticles = [...articles];
        sortedArticles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        expect(articles).toEqual(sortedArticles);
      })
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: return array of comments with correct article_id and properties", () => {
    return request(app)
      .get("/api/articles/9/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual(expect.objectContaining([
          {
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            article_id: 9,
            author: 'butter_bridge',
            votes: 16,
            created_at: '2020-04-06T12:17:00.000Z'
          },
          {
            comment_id: 17,
            body: 'The owls are not what they seem.',
            article_id: 9,
            author: 'icellusedkars',
            votes: 20,
            created_at: '2020-03-14T17:02:00.000Z'
          }
        ]));
      });
  });

  test("404: return 'Article does not exist' when requesting an Id that is not in the database", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Article does not exist')
      });
  });

  test("200: objects in returned Array are ordered by most recent", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        const sortedCommentsCopy = [...comments];
        sortedCommentsCopy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        expect(comments).toEqual(sortedCommentsCopy);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: inserts and returns comment for existing user", () => {
    const newComment = {
      username: 'icellusedkars',
      body: "example comment",
    }
    return request(app)
      .post("/api/articles/9/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            body: newComment.body,
            article_id: 9,
            author: newComment.username,
            votes: 0,
            created_at: expect.any(String)
          })
        );
      });

  });

  test("201: inserts and returns comment for non existing user", () => {
    const newComment = {
      username: 'NEW USER1',
      body: "example comment 2",
    }
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            body: newComment.body,
            article_id: 2,
            author: newComment.username,
            votes: 0,
            created_at: expect.any(String)
          })
        );
      });

  });

});

describe('PATCH /api/articles/:article_id', ()=>{
  test('should return the article', () => {
    return request(app).patch('/api/articles/1')
    .send({inc_votes:0}).expect(200).then(({body})=>{
      expect(body.article_id).toEqual(1)
      expect(body.author ).toEqual('butter_bridge')
      expect(body.title ).toEqual("Living in the shadow of a great man")
      expect(body.topic ).toEqual("mitch")
      expect(body.body).toEqual("I find this existence challenging")
      expect(body.votes ).toEqual(100)
      expect(body.created_at ).toEqual( "2020-07-09T20:11:00.000Z" )
    })
  });

  test('should increase the articles votes by specified amount', () => {
    return request(app).patch('/api/articles/2')
    .send({inc_votes:33}).expect(200).then(({body})=>{
      expect(body.votes).toEqual(33)
    })
  });

  test('should decrease the articles votes by specified amount', () => {
    return request(app).patch('/api/articles/1')
    .send({inc_votes:-10}).expect(200).then(({body})=>{
      expect(body.votes).toEqual(90)
    })
  });

  test('status 400 bad request when invalid value for inc_votes', () => {
    return request(app).patch('/api/articles/2')
    .send({inc_votes:'asdasd'}).expect(400).then(({body})=>{
      expect(body.msg).toBe('bad request')
    })
  });

  test("status 404 for non existent article", () => {
    return request(app).patch('/api/articles/999').send({inc_votes:10}).expect(404).then(({body})=>{
      expect(body.msg).toBe('Article does not exist')
    })
  });
});

describe('DELETE /api/comments/:comment_id',()=>{
  test('status 204, no content returned', () => {
    return request(app).delete('/api/comments/1').expect(204)
  });
  test('should delete comment with corresponsing id', () => {
    return request(app).delete('/api/comments/10').expect(204).then(({body})=>{
      return request(app).get('/api/articles/3/comments').expect(200).then(({body})=>{
        expect(body.comments.length).toBe(1)
      })
    })
  });
  test('400 for invalid id', () => {
    return request(app).delete('/api/comments/fgfd').expect(400).then(({body})=>{
      expect(body.msg).toBe('bad request')
    })
  });
  test('404 for valid but non existent id', () => {
    return request(app).delete('/api/comments/200000').expect(404).then(({body})=>{
      expect(body.msg).toBe('comment not found')
    })
  });
})

describe('GET /api/users',()=>{
  test('200: respond with an array of correct size', () => {
    return request(app).get('/api/users').expect(200).then(({body})=>{
      expect(body.users).toBeInstanceOf(Array)
      expect(body.users.length).toBe(4)
    })
  });
  test('200: should respond with object of users', () => {
    return request(app).get('/api/users').expect(200).then(({body})=>{
      const user1 = body.users[0]
      const expected = {
        username: 'butter_bridge',
        name: 'jonny',
        avatar_url:
          'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'
      }
      expect(user1).toMatchObject(expected)
    })
  });
})


describe('GET /api/articles (sort by queries)',()=>{
  test('should return articles in descending order ', () => {
      return request(app).get('/api/articles?sort_by=created_at').expect(200).then(({body})=>{
        expect(body.articles).toBeSortedBy('created_at',{descending:true})
      })
  });
  test('sort_by title', () => {
      return request(app).get('/api/articles?sort_by=title').expect(200).then(({body})=>{
        expect(body.articles).toBeSortedBy('title',{descending:true})
      })
  });
  test('sort_by article id', () => {
      return request(app).get('/api/articles?sort_by=article_id').expect(200).then(({body})=>{
        expect(body.articles).toBeSortedBy('article_id',{descending:true})
      })
  });
  test('sort_by votes', () => {
      return request(app).get('/api/articles?sort_by=votes').expect(200).then(({body})=>{
        expect(body.articles).toBeSortedBy('votes',{descending:true})
      })
  });
  test('sort_by comment_count', () => {
      return request(app).get('/api/articles?sort_by=comment_count').expect(200).then(({body})=>{
        
        const sortedArticles = [...body.articles];
        sortedArticles.sort((a, b) => Number(b.comment_count) - Number(a.comment_count))
        expect(body.articles).toEqual(sortedArticles);
      })
  });
  test('sort_by topic', () => {
      return request(app).get('/api/articles?sort_by=topic').expect(200).then(({body})=>{
        expect(body.articles).toBeSortedBy('topic',{descending:true})
      })
  });
  test('sort_by author', () => {
      return request(app).get('/api/articles?sort_by=author').expect(200).then(({body})=>{
        expect(body.articles).toBeSortedBy('author',{descending:true})
      })
  });
  test('order=asc should change order to ascending', () => {
      return request(app).get('/api/articles?sort_by=article_id&order=asc').expect(200).then(({body})=>{
        expect(body.articles).toBeSortedBy('article_id')
      })
    });
  test('order=desc should change order to descending', () => {
      return request(app).get('/api/articles?sort_by=article_id&order=desc').expect(200).then(({body})=>{
        expect(body.articles).toBeSortedBy('article_id',{descending:true})
      })
    });
  test('sort_by defaults to creat_at', () => {
      return request(app).get('/api/articles?order=asc').expect(200).then(({body})=>{
        expect(body.articles).toBeSortedBy('created_at')
      })
    });
  test('400: invalid sort_by query', () => {
      return request(app).get('/api/articles?sort_by=banana').expect(400).then(({body})=>{
        expect(body.msg).toBe('bad request')
      })
    });
  test('400: invalid order query', () => {
      return request(app).get('/api/articles?order=banana').expect(400).then(({body})=>{
        expect(body.msg).toBe('bad request')
      })
    });
})

describe('GET /api/articles topics filter query',()=>{
  test('should filter results using topic query, topic = mitch', () => {
    return request(app).get('/api/articles?topic=mitch&limit=50000').expect(200).then(({body})=>{
      body.articles.forEach(article=>{
        expect(article.topic).toBe('mitch')
      })
      expect(body.articles.length).toBe(12)
    })
  });
  test('Should filter for articles with topic "cat"', () => {
    return request(app).get('/api/articles?topic=cats').expect(200).then(({body})=>{
      body.articles.forEach(article=>{
        expect(article.topic).toBe('cats')
      })
      expect(body.articles.length).toBe(1)
    })
  });
  test('should return article not found message when given a topic with no articles', () => {
    return request(app).get('/api/articles?topic=paper').expect(404).then(({body})=>{
      expect(body.msg).toBe('Article does not exist')
    })
  });
})

describe('GET/api/articles/:article_id now includes comment count',()=>{
  test('200 article should now include comment count property', () => {
    return request(app).get('/api/articles/1').expect(200).then(({body})=>{
      expect(body).toHaveProperty("comment_count")
    })
  });
  test('200: comment_count hold correct amount for article 1', () => {
    return request(app).get('/api/articles/1').expect(200).then(({body})=>{
      expect(body.comment_count).toEqual('11')
    })
  });
  test('200:comment_count hold correct amount for article 2', () => {
    return request(app).get('/api/articles/2').expect(200).then(({body})=>{
      expect(body.comment_count).toEqual('0')
    })
  });
})