/**
 * @author Tejus Revi, Mahek Parmar
 * @version 1.0
 * Date: March 13, 2022
 * This script acts as the controller for the exercise object
 * We carry out several operations on the exercise object,
 * using the functionalities provided by this script.
 *
 */

const Exercise = require("../model/exercise").Exercise;

/**
 * A function that gets/lists the exercise provided the exercise id
 * the exercise id is supplied via the endpoints
 * @param {*} req
 * @param {*} res
 */
module.exports.getExerciseByID = async (req, res) => {
  let exerciseID = req.params.exerciseID;
  let msg = {};
  let exerciseObj = await Exercise.getExerciseByID(exerciseID);
  if (exerciseObj) {
    res.send(exerciseObj);
  } else {
    res.send(
      (msg = {
        success: false,
        message: "Incorrect ID.",
      })
    );
  }
};

/**
 * A function that gets all the exercises given the bodyPart, target muscle and equipment
 * the bodyPart, targetMuscle and equiptment attributes will be passed via the endpoints
 * @param {*} req
 * @param {*} res
 */
module.exports.getAllExercise = async (req, res) => {
  let bodyPart = req.query.bodyPart;
  let target = req.query.target;
  let equipment = req.query.equipment;

  res.send(await Exercise.getAllExercise(bodyPart, target, equipment));
};
