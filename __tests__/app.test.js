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
        expect(article_id).toEqual(1)
      })
  });

  test("400: return 'invalid id' message when requesting an id that is not in the database", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('invalid id')
      })
  });

  test("404: return 'bad request' message when requesting with an invalid input type", () => {
    return request(app)
      .get("/api/articles/asd")
      .expect(404)
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
        sortedArticles.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        expect(articles).toEqual(sortedArticles);
      })
  });
});