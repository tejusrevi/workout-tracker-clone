var assert = require("assert");
const { WorkoutProgram } = require("../model/workoutProgram");
const validation = require("../utils/validate-fields");
var request = require("supertest");

var myurl = "http://localhost:3000";
var server = request.agent(myurl);

// Variable to store the id of workoutPrograms that will be created in this test
let publicProgramID;
let privateProgramID;

// Variable to store exerciseID of exercise that will be created in this test
let exerciseID = "0047";

function loginUser() {
  return function (done) {
    server
      .post("/auth/local")
      .send({ email: "rock@mun.ca", password: "password" })
      .end(onResponse);

    function onResponse(err, res) {
      if (err) return done(err);
      return done();
    }
  };
}

function logoutUser() {
  return function (done) {
    server.get("/logout").end(onResponse);

    function onResponse(err, res) {
      if (err) return done(err);
      return done();
    }
  };
}

describe("Workout Application - Testing WorkoutProgram resource", function () {
  // Create a test user before all tests
  before(function (done) {
    server
      .post("/user")
      .send({
        isLocal: true,
        username: "Dwayne Johnson",
        email: "rock@mun.ca",
        password: "password",
      })
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        return done();
      });
  });

  // Delete the test user after tests are done
  after(function (done) {
    server.delete("/user").end(function (err, res) {
      if (err) throw err;
      return done();
    });
  });

  describe("Test Models", function () {
    describe("WorkoutProgram", function () {
      // Tests if validation.validWorkoutProgramInfo returns false when nameOfProgram is empty
      it("Test if WorkoutProgram is invalid(empty nameOfProgram)", async function () {
        let isPublic = 0;
        let nameOfProgram = "";
        assert.strictEqual(
          validation.validWorkoutProgramInfo(isPublic, nameOfProgram).valid,
          false
        );
      });
      // Tests if validation.validWorkoutProgramInfo returns true when valid if is provided
      it("Test if WorkoutProgram is valid", async function () {
        let isPublic = 0;
        let nameOfProgram = "30 Day Leg Workout";
        assert.strictEqual(
          validation.validWorkoutProgramInfo(isPublic, nameOfProgram).valid,
          true
        );
        let workoutProgram = new WorkoutProgram(isPublic, nameOfProgram);
        assert.strictEqual(workoutProgram.isPublic, false);
        assert.strictEqual(workoutProgram.nameOfProgram, nameOfProgram);
      });
    });
  });
  describe("Test API calls", function () {
    describe("POST /workoutProgram", function () {
      // Trying to mke a post request to /workoutProgram as an unauthenticated user. The request returns an error message as this endpoint requires authentication
      it("Fail 1 - Create Workout Programs as an unauthenticated user", function (done) {
        server
          .post("/workoutProgram")
          .send({
            isPublic: 0,
            nameOfProgram: "5-Day Abs Program",
          })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(
              res.body.message,
              "User needs to be authenticated to perform this action."
            );
            return done();
          });
      });

      // Trying to mke a post request to /workoutProgram as an authenticated user, but with empty nameOfProgram. The request returns an error message.
      it("Login user", loginUser());
      it("Fail 2 - Authenticated user, but with empty nameOfProgram", function (done) {
        server
          .post("/workoutProgram")
          .send({
            isPublic: 0,
            nameOfProgram: "",
          })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            return done();
          });
      });

      // Trying to mke a post request to /workoutProgram as an authenticated user, but with invalid isPublic. isPublic has to be either 0 or 1. The request returns an error message.
      it("Fail 3 - Authenticated user, but with wrong isPublic", function (done) {
        server
          .post("/workoutProgram")
          .send({
            isPublic: "public",
            nameOfProgram: "5-Day Abs Program",
          })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            return done();
          });
      });

      // Trying to mke a post request to /workoutProgram as an authenticated user, but with no nameOfProgram in body params. The request returns an error message.
      it("Fail 4 - Authenticated user, but with missing nameOfProgram", function (done) {
        server
          .post("/workoutProgram")
          .send({
            isPublic: 1,
          })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            return done();
          });
      });

      // Trying to mke a post request to /workoutProgram as an authenticated user, but with no isPublic in bosy params. The request returns an error message.
      it("Fail 5 - Authenticated user, but with missing isPublic", function (done) {
        server
          .post("/workoutProgram")
          .send({
            nameOfProgram: "5-Day Abs Program",
          })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            return done();
          });
      });

      // Trying to mke a post request to /workoutProgram as an authenticated user, with valid isPublic and nameOfProgram. The request succeeds. A new private program is created
      it("Login user", loginUser());
      it("Success 1 - Create Workout Programs as an authenticated user (private program)", function (done) {
        server
          .post("/workoutProgram")
          .send({
            isPublic: 0,
            nameOfProgram: "Private 5-Day Abs Program",
          })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(
              res.body.message,
              "A new workout program was created."
            );
            privateProgramID = res.body.insertedID;
            return done();
          });
      });

      // Trying to mke a post request to /workoutProgram as an authenticated user, with valid isPublic and nameOfProgram. The request succeeds. A new public program is created.
      it("Success 2 - Create Workout Programs as an authenticated user (public program)", function (done) {
        server
          .post("/workoutProgram")
          .send({
            isPublic: 1,
            nameOfProgram: "Public 5-Day Abs Program",
          })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(
              res.body.message,
              "A new workout program was created."
            );
            publicProgramID = res.body.insertedID;
            return done();
          });
      });
    });

    // Trying to mke a get request to /workoutProgram/:workoutProgramID as an unauthenticated user. The workout program being accessed is public, therefore the request succeeds.
    describe("GET /workoutProgram/:workoutProgramID", function () {
      it("Logout user", logoutUser());
      it("Success 1 - Unaunthenticated user trying to access public program", function (done) {
        server
          .get("/workoutProgram/" + publicProgramID)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(
              res.body.nameOfProgram,
              "Public 5-Day Abs Program"
            );
            return done();
          });
      });

      // Trying to mke a get request to /workoutProgram/:workoutProgramID as an unauthenticated user. The workout program being accessed is private, therefore the request fails.
      it("Fail 1 - Unaunthenticated user trying to access private program", function (done) {
        server
          .get("/workoutProgram/" + privateProgramID)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(
              res.body.message,
              "You are not authorized to view this information."
            );
            return done();
          });
      });

      // Trying to mke a get request to /workoutProgram/:workoutProgramID as an authenticated user. The workout program being accessed is private, but was created by the suer trying to access it. Therefore the request succeeds.
      it("Login user", loginUser());
      it("Success 1 - Authenticated user trying to access private program", function (done) {
        server
          .get("/workoutProgram/" + privateProgramID)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(
              res.body.nameOfProgram,
              "Private 5-Day Abs Program"
            );
            return done();
          });
      });
    });

    // Trying to make a put request to /workoutProgram/workoutProgramID as an unauthenticated user. The request fails as this endpoint requires authentication.
    describe("PUT /workoutProgram/workoutProgramID", function () {
      it("Logout user", logoutUser());
      it("Fail 1 - Unauthenticated user trying to update public program's program name", function (done) {
        server
          .put("/workoutProgram/" + publicProgramID)
          .send({
            isPublic: 0,
            nameOfProgram: "Private 10-Day Chest Program",
          })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(
              res.body.message,
              "User needs to be authenticated to perform this action."
            );

            return done();
          });
      });
      // Trying to make a put request to /workoutProgram/workoutProgramID as an authenticated user. The request succeeds.
      it("Login user", loginUser());
      it("Success 1 - Authenticated user trying to update public program's program name", function (done) {
        server
          .put("/workoutProgram/" + publicProgramID)
          .send({
            isPublic: 1,
            nameOfProgram: "Public 10-Day Chest Program",
          })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.message, "Workout Plan was updated.");
            return done();
          });
      });
    });
    // Trying to make a get request to /workoutProgram as an unauthenticated user. The request will return all public workout programs.
    describe("GET /workoutProgram", function () {
      it("Logout user", logoutUser());
      it("Success 2 - Unuthenticated user trying to access all workout programs", function (done) {
        server.get("/workoutProgram/").end(function (err, res) {
          if (err) return done(err);
          assert.strictEqual(Array.isArray(res.body), true);
          return done();
        });
      });
    });

    // Trying to make a put request to /workoutProgram/addExercise/:workoutProgramID as an authenticated user. The request succeeds.
    describe("PUT /workoutProgram/addExercise/:workoutProgramID", function () {
      it("Login user", loginUser());
      it("Success 1 - Authenticated user trying to add an exercise to (public) workout program", function (done) {
        server
          .put("/workoutProgram/addExercise/" + publicProgramID)
          .send({
            exerciseID: exerciseID,
            numSets: 4,
            numReps: 12,
          })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(
              res.body.message,
              "Exercise was addedd to workout program."
            );
            return done();
          });
      });

      // Trying to make a put request to /workoutProgram/removeExercise/:workoutProgramID as an authenticated user. The request succeeds.
      it("Success 2 - Authenticated user trying to remove an exercise from (public) workout program", function (done) {
        server
          .put("/workoutProgram/removeExercise/" + publicProgramID)
          .query({
            exerciseID: exerciseID,
          })
          .end(function (err, res) {
            if (err) return done(err);
            //assert.strictEqual(res.body.success, true);
            assert.strictEqual(
              res.body.message,
              "Exercise removed from workout program."
            );
            return done();
          });
      });
    });

    // Trying to make a delete request to /workoutProgram/workoutProgramID as an unauthenticated user. The request fails as this endpoint requires authentication.
    describe("DELETE /workoutProgram/:workoutProgramID", function () {
      it("Logout user", logoutUser());
      it("Fail 1 - Unauthenticated user trying to delete workout programs", function (done) {
        server
          .delete("/workoutProgram/" + publicProgramID)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(
              res.body.message,
              "User needs to be authenticated to perform this action."
            );
            return done();
          });
      });

      // Trying to make a delete request to /workoutProgram/removeExercise/:workoutProgramID as an authenticated user. The request succeeds.
      it("Login user", loginUser());
      it("Success 1 - Authenticated user trying to delete workout programs (public)", function (done) {
        server
          .delete("/workoutProgram/" + publicProgramID)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.message, "Workout Plan was deleted.");
            return done();
          });
      });

      // Trying to make a delete request to /workoutProgram/removeExercise/:workoutProgramID as an authenticated user. The request succeeds.
      it("Success 2 - Authenticated user trying to delete workout programs (private)", function (done) {
        server
          .delete("/workoutProgram/" + privateProgramID)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.message, "Workout Plan was deleted.");
            return done();
          });
      });
    });
  });
});
