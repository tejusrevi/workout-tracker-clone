const express = require("express");
const session = require("express-session");
var path = require("path");
const passport = require("passport");

const app = express();
const port = 3000;

app.use(express.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); //incoming objects are strings or arrays
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize()); // init passport on every route call
app.use(passport.session()); //allow passport to use "express-session"

const mongo = require("./utils/db.js");
const auth = require("./utils/auth.js");

const userController = require("./controller/userController.js");
const exerciseController = require("./controller/exerciseController.js");
const workoutProgramController = require("./controller/workoutProgramController.js");
const workoutProgram = require("./model/workoutProgram").WorkoutProgram;

app.use(express.static(__dirname + "/view/public"));

async function createServer() {
  try {
    await mongo.connectToDB();

    // Local auth
    app.post(
      "/auth/local",
      passport.authenticate("local", {
        successRedirect: "/user",
        failureRedirect: "/",
      })
    );

    // Google Auth
    app.get(
      "/auth/google",
      passport.authenticate("google", { scope: ["email", "profile"] })
    );

    // Callback function for google auth
    app.get(
      "/auth/google/callback",
      passport.authenticate("google", {
        successRedirect: "/dashboard",
        failureRedirect: "/",
      })
    );

    // CRUD operations on User model
    app.get("/user", auth.checkAuthenticated, userController.getUserByID);
    app.post("/user", userController.addLocal);
    app.delete("/user", auth.checkAuthenticated, userController.deleteUser);
    app.put("/user", auth.checkAuthenticated, userController.updateUser);
    app.put(
      "/user/personalInformation",
      auth.checkAuthenticated,
      userController.updatePersonalInformation
    );
    app.get(
      "/user/workoutPrograms",
      auth.checkAuthenticated,
      workoutProgramController.getWorkoutProgramsByUser
    );

    // CRUD operations on WorkoutProgram model
    app.get(
      "/workoutProgram",
      workoutProgramController.getAllPublicWorkoutPrograms
    );
    app.get(
      "/workoutProgram/:workoutProgramID",
      workoutProgramController.getWorkoutProgramByID
    );
    app.post(
      "/workoutProgram",
      auth.checkAuthenticated,
      workoutProgramController.addWorkoutProgram
    );
    app.delete(
      "/workoutProgram/:workoutProgramID",
      auth.checkAuthenticated,
      workoutProgramController.deleteWorkoutProgram
    );
    app.put(
      "/workoutProgram/:workoutProgramID",
      auth.checkAuthenticated,
      workoutProgramController.updateWorkoutProgramDetails
    );

    app.put(
      "/workoutProgram/addExercise/:workoutProgramID",
      auth.checkAuthenticated,
      workoutProgramController.addExerciseToWorkoutProgram
    );

    app.put(
      "/workoutProgram/removeExercise/:workoutProgramID", // Exercise id passed as query param
      auth.checkAuthenticated,
      workoutProgramController.removeExerciseFromWorkoutProgram
    );

    // Read operations on Exercise Model
    app.get("/exercise/:exerciseID", exerciseController.getExerciseByID);
    app.get("/exercise", exerciseController.getAllExercise);

    // Logout the current user
    app.get("/logout", auth.checkAuthenticated, userController.logout); // Receives userID from the session

    //front-end
    app.get("/dashboard", auth.checkAuthenticated, async (req, res) => {
      res.sendFile(__dirname + '/view/dashboard.html')
    }); 

    app.get("/workout-program/:workoutProgramID", async (req, res) =>{
      if (await workoutProgramController.displayEditablePage(req, res)){
        res.sendFile(__dirname + '/view/workout-program.html')
      }else{
        res.sendFile(__dirname + '/view/public-workout-program.html')
      }
    }); 


    // start the server
    server = app.listen(port, () => {
      console.log("App listening at http://localhost:%d", port);
    });
  } catch (err) {
    console.log(err);
  }
}
createServer();

/**
process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  console.log('Closing Mongo Client.');
  server.close(async function(){
    let msg = await mongo.closeDBConnection()   ;
    console.log(msg);
  });
  
});
*/
