var assert = require("assert");
var request = require("supertest");

var myurl = "http://localhost:3000";
var server = request.agent(myurl);

var exerciseID = "1003"; // ID for 'band squat row'

describe("Workout Application - Testing Exercise resource", function () {
  describe("Test API calls", function () {
    describe("GET /exercise", function () {
      // Makes a get request to /exercise. Should display all exercise objects as an array. The array should contain 1327 objects.
      it("Success 1. GET - fetch all exercise", function (done) {
        server
          .get("/exercise")
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.length, 1327);
            done();
          });
      });
    });
    describe("GET /exercise/:exerciseID", function () {
      // Makes a get request to /exercise/:exerciseID with invalid ID. Should return an error message
      it("Fail 1. GET - fetch exercise by exerciseID (Incorrect ID)", function (done) {
        server
          .get("/exercise/" + "IDthatDoesntExist")
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(res.body.message, "Incorrect ID.");
            done();
          });
      });
      // Makes a get request to /exercise/:exerciseID with valid ID of 1003. This id corresponds to exercise 'band squat row'
      it("Success 1. GET - fetch exercise by exerciseID", function (done) {
        server
          .get("/exercise/" + exerciseID)
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.name, "band squat row");
            done();
          });
      });
    });
  });
});
