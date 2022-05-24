var assert = require("assert");
const { User } = require("../model/user");
const validation = require("../utils/validate-fields");
const axios = require("axios");
var request = require("supertest");

var myurl = "http://localhost:3000";
var server = request.agent(myurl);

const instance = axios.create({
  baseURL: myurl,
  timeout: 5000, //5 seconds max
  headers: { "content-type": "application/json" },
  withCredentials: true,
});

/**
 * Function to authenticate user before requesting an endpoint that requires authentication
 */
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

/**
 * Function to logout user to test if an unauthenticated user is able to perform the action.
 */
function logoutUser() {
  return function (done) {
    server.get("/logout").end(onResponse);
    function onResponse(err, res) {
      if (err) return done(err);
      return done();
    }
  };
}

describe("Workout Application - Testing User resource", function () {
  describe("Test Models", function () {
    describe("User", function () {
      // Tests if validation.validUserInfo returns false when an incorrect email is provided
      it("Test if user is invalid(Invalid Email)", async function () {
        let username = "Dwayne Johnson";
        let email = "rock@@mun.c#$a";
        let password = "password";
        assert.strictEqual(
          validation.validUserInfo(username, email, password).valid,
          false
        );
      });

      // Test if validation.validUserInfo returns true when valid user info is provided
      it("Test if user is valid", async function () {
        let username = "Dwayne Johnson";
        let email = "rock@mun.ca";
        let password = "password";
        assert.strictEqual(
          await validation.validUserInfo(username, email, password).valid,
          true
        );
        let user = new User(true, username, email, password);
        assert.strictEqual(user.username, username);
        assert.strictEqual(user.email, email);
        assert.strictEqual(user.password, password);
      });
    });
  });
  describe("Test API calls", function () {
    describe("POST /user", async function () {
      // Trying to make a post request to /user with invalid email address in body params. The request should return body.success: false as the operation has failed.
      it("Fail 1. POST - Test invalid email in the object", async function () {
        let data = {
          isLocal: true,
          username: "Dwayne Johnson",
          email: "rock@mudan.caa$dad",
          password: "password",
        };
        let res = await instance.post("/user", data);
        assert.strictEqual(res.data.success, false);
      });

      //Trying to make a post request to /user with no email address in body params. The request should return body.success: false as the operation has failed.
      it("Fail 2. POST - Test no email in the object", async function () {
        let data = {
          isLocal: true,
          username: "Dwayne Johnson",
          password: "password",
        };
        let res = await instance.post("/user", data);
        assert.strictEqual(res.data.success, false);
      });

      // Trying to make a post request to /user with no password in body params. The request should return body.success: false as the opration has failed.
      it("Fail 3. POST - Test no password in the object", async function () {
        let data = {
          isLocal: true,
          username: "Dwayne Johnson",
          email: "rock@mun.ca",
        };
        let res = await instance.post("/user", data);
        assert.strictEqual(res.data.success, false);
      });

      // Trying to make a post request to /user with no username in body params. The request should return body.success: false as the opration has failed.
      it("Fail 4. POST - Test no username in the object", async function () {
        let data = {
          isLocal: true,
          email: "rock@mun.ca",
          password: "password",
        };
        let res = await instance.post("/user", data);
        assert.strictEqual(res.data.success, false);
      });

      // Trying to make a post request to /user with empty email in body params. The request should return body.success: false as the opration has failed.
      it("Fail 5. POST - Test empty email in the object", async function () {
        let data = {
          isLocal: true,
          username: "Dwayne Johnson",
          password: "password",
          email: "",
        };
        let res = await instance.post("/user", data);
        assert.strictEqual(res.data.success, false);
      });

      // Trying to make a post request to /user with empty password in body params. The request should return body.success: false as the opration has failed.
      it("Fail 6. POST - Test empty password in the object", async function () {
        let data = {
          isLocal: true,
          username: "Dwayne Johnson",
          email: "rock@mun.ca",
          password: "",
        };
        let res = await instance.post("/user", data);
        assert.strictEqual(res.data.success, false);
      });

      // Trying to make a post request to /user with empty username in body params. The request should return body.success: false as the opration has failed.
      it("Fail 7. POST - Test empty username in the object", async function () {
        let data = {
          isLocal: true,
          email: "rock@mun.ca",
          password: "password",
          username: "",
        };
        let res = await instance.post("/user", data);
        assert.strictEqual(res.data.success, false);
      });

      // Trying to make a post request to /user with valid information in body params. The request should return body.success: true as the opration has succeeded.
      // The message User 'Dwayne Johnson was correctly inserted to the database.' is returned
      it("Success 1. POST - Test with valid email, username and password", async function () {
        let data = {
          isLocal: true,
          username: "Dwayne Johnson",
          email: "rock@mun.ca",
          password: "password",
        };
        let res = await instance.post("/user", data);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(
          res.data.message,
          "User Dwayne Johnson was correctly inserted to the database."
        );
      });

      // Trying to make a post request to /user with valid information, but with same email address as previous request.
      // The request should return body.success: false as the opration has failed. Email addresses must be unique
      it("Fail 8. POST - Adding user with the same email again", async function () {
        let data = {
          isLocal: true,
          username: "Dwayne Johnson",
          email: "rock@mun.ca",
          password: "password",
        };
        let res = await instance.post("/user", data);
        assert.strictEqual(res.data.success, false);
        assert.strictEqual(
          res.data.message,
          "Email address already exists. Try logging in."
        );
      });
    });
    describe("POST /auth/local", async function () {
      // Trying to make a post request to /auth/local with incorrect password.
      // When password is incorrect, user is redirected to the homepage (ie, /) to authenticate again
      it("Fail 1 - Try authenticating with incorrect username and password", function (done) {
        server
          .post("/auth/local")
          .send({ email: "rock@mun.ca", password: "wrongPassword" })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.header.location, "/"); // Unauthenticated user gets redirected to /
            return done();
          });
      });

      // Trying to make a post request to /auth/local with correct password.
      // When password is correct, user is redirected to /user
      it("Success 1 - Try authenticating with correct username and password", function (done) {
        server
          .post("/auth/local")
          .send({ email: "rock@mun.ca", password: "password" })
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.header.location, "/user"); // Authenticated user gets redirected to /user
            return done();
          });
      });
    });
    describe("GET /user", function () {
      // Trying to make a get request to /user as unauthenticated user. Since this endpoint requires authentication, the request returns an error message.
      it("Logout user", logoutUser());
      it("Fail 1. GET - fetch user information without authenticating", function (done) {
        server
          .get("/user")
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            done();
          });
      });

      // Trying to make a get request to /user as authenticated user. The user's info is returned, except their password.
      it("Login user", loginUser());
      it("Success 1. GET - fetch user information with an authenticated user", function (done) {
        server
          .get("/user")
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.username, "Dwayne Johnson");
            done();
          });
      });
    });
    describe("PUT /user & PUT user/personalInformation", function () {
      // Trying to make a put request to /user as unauthenticated user. Since this endpoint requires authentication, the request returns an error message.
      it("Logout  user", logoutUser());
      it("Fail 1. PUT - Update username without authenticating", function (done) {
        server
          .put("/user")
          .send({
            username: "Not Dwayne",
            password: "password",
          })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            done();
          });
      });

      // Trying to make a put request to /user as authenticated user. The request will succeed, and display result of the operation.
      it("Logging in user", loginUser());
      it("Success 1. PUT - Update username after authenticating", function (done) {
        server
          .put("/user")
          .send({
            username: "Not Dwayne",
            password: "password",
          })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.message, "User was updated.");
            done();
          });
      });

      // Logs in user again as updating account will log out user. Username is updated again for the purpose of testing
      it(
        "Login User (because updating account info logs out user)",
        loginUser()
      );
      it("Success 2. PUT - Update username after authenticating again", function (done) {
        server
          .put("/user")
          .send({
            username: "Dwayne Johnson",
            password: "password",
          })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.message, "User was updated.");
            done();
          });
      });

      // Trying to make a put request to /user/personalInformation as unauthenticated user. Since this endpoint requires authentication, the request returns an error message.
      it("Logout user", logoutUser());
      it("Fail 2. PUT - Update personal info of unauthenticated user", function (done) {
        server
          .put("/user/personalInformation")
          .send({
            age: 49,
            gender: "male",
            height: 196,
            weight: 118,
            goalWeight: 120,
          })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            done();
          });
      });

      // Trying to make a put request to /user as authenticated user. The body parameters passed are invalid, and therefore the request will return an error message.
      it("Login user", loginUser());
      it("Fail 3. PUT - Update personal info of authenticated user with incorrect input", function (done) {
        server
          .put("/user/personalInformation")
          .send({
            age: "forty nine",
            gender: "male",
            height: "one hundred ninety six",
            weight: "one hundred eighteen",
            goalWeight: "one hundrend twenty",
          })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            done();
          });
      });

      // Trying to make a put request to /user as authenticated user. The request will succeed, and display result of the operation.
      it("Success 3. PUT - Update personal info of authenticated user", function (done) {
        server
          .put("/user/personalInformation")
          .send({
            age: 49,
            gender: "male",
            height: 196,
            weight: 118,
            goalWeight: 120,
          })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, true);
            done();
          });
      });
    });
    describe("DELETE /user", function () {
      // Trying to make a delete request to /user as an unauthenticated user. The request will fail.
      it("Logout user", logoutUser());
      it("Fail 1. DELETE - Delete unauthenticated user", function (done) {
        server
          .delete("/user")
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, false);
            done();
          });
      });

      // Trying to make a delete request to /user as an authenticated user. The request will succeed.
      it("Login user", loginUser());
      it("Success 1. DELETE - Delete authenticated user", function (done) {
        server
          .delete("/user")
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            assert.strictEqual(res.body.success, true);
            done();
          });
      });
    });
  });
});
