/**
 * @author Tejus Revi, Mahek Parmar
 * @version 1.0
 * Date: March 13, 2022
 * This script acts as the controller for the workoutProgram object
 * We carry out several operations on the workoutProgram object including CRUD,
 * using the functionalities provided by this script.
 *
 */

const WorkoutProgram = require("../model/workoutProgram.js").WorkoutProgram;
const Exercise = require("../model/exercise.js").Exercise;
const validator = require("../utils/validate-fields.js");

/**
 * A function that gets/lists all the workoutPrograms that are public
 * @param {*} req
 * @param {*} res
 */
module.exports.getAllPublicWorkoutPrograms = async (req, res) => {
  res.send(await WorkoutProgram.getAllPublicWorkoutPrograms());
};

/**
 * A function that gets a workoutProgram based on its id.
 * The id of the workoutProgram to add would be received via the endpoint parameter.
 * @param {*} req
 * @param {*} res
 */
module.exports.getWorkoutProgramByID = async (req, res) => {
  let workoutProgramID = req.params.workoutProgramID;
  workoutObj = await WorkoutProgram.getWorkoutProgramByID(workoutProgramID);
  if (workoutObj != null) {
    if (workoutObj.isPublic) {
      //if the workout program is public, then we send it via the response
      res.send(workoutObj);
    } else if (req.user) {
      //if the workout program is made by our current user, then also we it via the response
      if (workoutObj.createdBy == req.user.user._id) {
        res.send(workoutObj);
      }
    } else {
      res.send({
        //if the workout program is not public and if the workout program is not created by the current user, then we do NOT send it.
        success: false,
        message: "You are not authorized to view this information.",
      });
    }
  } else {
    //the case where the workout program id inputted is valid or does not exist.
    res.send({
      success: false,
      message: "Invalid Workout Program ID.",
    });
  }
};

/**
 * A function that gets all the workout programs created by a particular user
 * The users id will be provided by the endpoint attributes
 * @param {*} req
 * @param {*} res
 */
module.exports.getWorkoutProgramsByUser = async (req, res) => {
  let userID = req.user.user._id; //get the users id
  res.send(await WorkoutProgram.getWorkoutProgramsByUser(userID));
};

/**
 * A function that creates and adds a workoutProgram
 *
 * @param {*} req
 * @param {*} res
 */
module.exports.addWorkoutProgram = async (req, res) => {
  let isPublic = req.body.isPublic;
  let nameOfProgram = req.body.nameOfProgram;
  let createdBy = req.user.user._id;

  let insertedID;
  let msg = {};

  let isFormValid = validator.validWorkoutProgramInfo(isPublic, nameOfProgram);

  if (isFormValid.valid) {
    if (isPublic != null && nameOfProgram != null) {
      insertedID = await new WorkoutProgram(
        isPublic,
        nameOfProgram,
        createdBy
      ).save(); //creating and adding the workout program with its respective attributes
      msg = {
        success: true,
        message: "A new workout program was created.",
        insertedID: insertedID,
      };
    } else {
      msg = {
        success: false,
        message: "Missing values for isPublic and nameOfWorkout.",
      };
    }
  } else {
    msg = {
      success: false,
      message: isFormValid.errorMessage,
    };
  }

  res.send(msg);
};

/**
 * A function that deletes a workoutProgram based on its id.
 * The id of the workoutProgram to delete would be received via the endpoint parameter.
 * @param {*} req
 * @param {*} res
 */
module.exports.deleteWorkoutProgram = async (req, res) => {
  let workoutProgramID = req.params.workoutProgramID;
  let workoutObj = await WorkoutProgram.getWorkoutProgramByID(workoutProgramID);
  let msg = {};
  if (workoutObj == null) {
    msg = {
      success: false,
      message: "Invalid Workout Program ID.",
    };
  } else if (workoutObj.createdBy == req.user.user._id) {
    //only the user who created the workout program can delete it
    await WorkoutProgram.deleteWorkoutProgram(workoutProgramID);
    msg = {
      success: true,
      message: "Workout Plan was deleted.",
    };
  } else {
    msg = {
      success: false,
      message: "You are not authorized to delete this information.",
    };
  }
  res.send(msg);
};

/**
 * A function that gets a workoutProgram based on its id.
 * The attributes to change will be received via the endpoint parameters.
 * @param {*} req
 * @param {*} res
 */
module.exports.updateWorkoutProgramDetails = async (req, res) => {
  let workoutProgramID = req.params.workoutProgramID;
  let isPublic = req.body.isPublic; //updated visibility  atrribute
  let nameOfProgram = req.body.nameOfProgram; //updated name of the workout program
  let msg = {};
  workoutObj = await WorkoutProgram.getWorkoutProgramByID(workoutProgramID);
  if (workoutObj == null) {
    msg = {
      success: false,
      message: "Invalid Workout Program ID.",
    };
  } else if (workoutObj.createdBy == req.user.user._id) {
    //only the user who create the workout program can edit it
    await WorkoutProgram.updateWorkoutProgramDetails(
      workoutProgramID,
      isPublic,
      nameOfProgram
    );
    msg = {
      success: true,
      message: "Workout Plan was updated.",
    };
  } else {
    msg = {
      success: false,
      message: "You are not authorized to update this information.",
    };
  }
  res.send(msg);
};

/**
 * A function that adds exercises to the said workoutProgram
 * The id of the workout program, and the exercise with the reps and sets will be provided by the endpoint attributes
 * @param {*} req
 * @param {*} res
 */
module.exports.addExerciseToWorkoutProgram = async (req, res) => {
  let workoutProgramID = req.params.workoutProgramID; //the workout programs id
  let exerciseID = req.body.exerciseID; //the id of the exercise to add
  let numSets = req.body.numSets; //number of sets of the exercise
  let numReps = req.body.numReps; //number of reps of the exercise
  let exercise = await Exercise.getExerciseByID(exerciseID);
  workoutObj = await WorkoutProgram.getWorkoutProgramByID(workoutProgramID);
  if (workoutObj == null) {
    msg = {
      success: false,
      message: "Invalid Workout Program ID.",
    };
  } else if (workoutObj.createdBy == req.user.user._id) {
    //again, only the user who creates the workout program can edit i.e. add/remove exercises from it
    let wasUpdated = await WorkoutProgram.addExerciseToWorkoutProgram(
      workoutProgramID,
      exercise,
      numSets,
      numReps
    );
    if (wasUpdated) {
      msg = {
        success: true,
        message: "Exercise was addedd to workout program.",
      };
    } else {
      msg = {
        success: false,
        message: "Exercise was not addedd to workout program.",
      };
    }
  } else {
    msg = {
      success: false,
      message: "You are not authorized to add exercises to this program.",
    };
  }
  res.send(msg);
};

/**
 * A function that removes exercises from the said workoutProgram
 * The id of the workout program, and the exercise to remove will be provided by the endpoint attributes
 * @param {*} req
 * @param {*} res
 */
module.exports.removeExerciseFromWorkoutProgram = async (req, res) => {
  let workoutProgramID = req.params.workoutProgramID; //workout program from where the exercise is to be removed
  let exerciseID = req.query.exerciseID; //id of the exercise to remove
  let msg = {};
  workoutObj = await WorkoutProgram.getWorkoutProgramByID(workoutProgramID);
  if (workoutObj == null) {
    msg = {
      success: false,
      message: "Invalid ID.",
    };
  } else if (workoutObj.createdBy == req.user.user._id) {
    //only the user who creates the workout program can edit i.e. add/remove exercises from it
    let wasRemoved = await WorkoutProgram.removeExerciseFromWorkoutProgram(
      workoutProgramID,
      exerciseID
    );
    if (wasRemoved) {
      msg = {
        success: true,
        message: "Exercise removed from workout program.",
      };
    } else {
      msg = {
        success: false,
        message: "Could not removed exercise from the workout program.",
      };
    }
  } else {
    msg = {
      success: false,
      message: "You are not authorized to add exercises to this program.",
    };
  }
  res.send(msg);
};

/**
 * Function to determine if the user has permission to view editable version of workout-program page
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.displayEditablePage = async (req, res) => {
  let workoutProgramID = req.params.workoutProgramID;
  let workoutObj = await WorkoutProgram.getWorkoutProgramByID(workoutProgramID);

  if (req.user && workoutObj.createdBy == req.user.user._id) {
    return true;
  } else {
    return false;
  }
};
