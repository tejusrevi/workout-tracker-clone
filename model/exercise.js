/**
 * @author Tejus Revi, Mahek Parmar
 * @version 1.0
 * Date: March 13, 2022
 * This script models an exercise object and provides several methods which
 * represent its functionality and behaviour.
 */

const client = require("../utils/db.js");
const ObjectId = require("mongodb").ObjectId;

/**
 * A private function that gets the mongoDb collection where all the exercises are stored
 * @returns the exercise collection
 */
async function _get_exercise_collection() {
  let db = await client.getDb();
  return await db.collection("exercise");
}

/**
 * Constructor for our Exercise object
 */
class Exercise {
  constructor(bodyPart, equipment, gifUrl, id, name, target) {
    this.bodyPart = bodyPart;
    this.equipment = equipment;
    this.gifUrl = gifUrl;
    this.id = id;
    this.name = name;
    this.target = target;
  }

  /**
   * This function gets the exercise provided the exerciseID
   * @param {int} exerciseID
   * @returns {Exercise} mongoObj
   */
  static async getExerciseByID(exerciseID) {
    try {
      let exerciseCollection = await _get_exercise_collection();
      let mongoObj = await exerciseCollection.findOne({ id: exerciseID });
      return mongoObj;
    } catch (err) {
      throw err;
    }
  }

  /**
   * This function gets all the exercises provided the bodyPart, target muscle and
   * the equipment type
   * @param {String} bodyPart
   * @param {String} target
   * @param {String} equipment
   * @returns {[Exercise]} mongoObj, an array containing all the matching Exercise objects
   */

  static async getAllExercise(bodyPart, target, equipment) {
    let queryString = {};
    if (bodyPart) {
      queryString["bodyPart"] = bodyPart;
    }
    if (target) {
      queryString["target"] = target;
    }
    if (equipment) {
      queryString["equipment"] = equipment;
    }
    try {
      let exerciseCollection = await _get_exercise_collection();
      let mongoObj = await exerciseCollection.find(queryString).toArray();
      return mongoObj;
    } catch (err) {
      throw err;
    }
  }
}

module.exports.Exercise = Exercise;
