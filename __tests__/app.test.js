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

beforeEach(() => seed({topicData,userData,articleData,commentData}))

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
        topics.forEach(function (topic) {
          expect(topic).toHaveProperty("slug")
          expect(topic).toHaveProperty("description")
        })
      });
  });

});
