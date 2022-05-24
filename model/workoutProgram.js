/**
 * @author Tejus Revi, Mahek Parmar
 * @version 1.0
 * Date: March 13, 2022
 * This script models a workoutProgram object and provides several methods which
 * represent its functionality and behaviour.
 */

const client = require("../utils/db.js");
const ObjectId = require("mongodb").ObjectId;

/**
 * This method gets the workout program collection from the mongoDb database
 * The workout program collection stores the various workout programs created by different users
 * @returns {}
 */
async function _get_users_collection() {
  let db = await client.getDb();
  return await db.collection("workout-program");
}

/**
 * The constructor for the WorkoutProgram object
 */
class WorkoutProgram {
  constructor(isPublic, nameOfProgram, createdBy) {
    if (isPublic == 0) {
      //isPublic, represents where the workout program is publically accessible or not
      this.isPublic = false;
    } else {
      this.isPublic = true;
    }
    this.nameOfProgram = nameOfProgram; //nameOfProgram, the name of the workout program
    this.createdBy = createdBy; //createdBy, the ObjectId (passed as String) of the User who created the workout
    this.exercises = []; //initially, the workout program contains no exercises in it.
  }

  /**
   * This methods saves/adds a WorkoutProgram to the workout-program collection in our mongoDb database
   * @returns {WorkoutProgram} mongoObj
   */
  async save() {
    try {
      let collection = await _get_users_collection();
      let mongoObj = await collection.insertOne(this);
      return mongoObj.insertedId;
    } catch (err) {
      throw err;
    }
  }

  /**
   * This methods retrieves a WorkoutProgram from the workout-program collection given the WorkoutProgram ID
   * @param {String} workoutProgramID, objectID of the WorkoutProgram passed as a string
   * @returns {WorkoutProgram} mongoObj
   */
  static async getWorkoutProgramByID(workoutProgramID) {
    try {
      let collection = await _get_users_collection();
      let mongoObj = await collection.findOne({
        _id: ObjectId(workoutProgramID),
      });
      return mongoObj;
    } catch (err) {
      throw err;
    }
  }

  /**
   * This methods retrieves all the public WorkoutProgram from the
   * workout-program collection
   * @returns {} mongoObj       //returns an array
   */
  static async getAllPublicWorkoutPrograms() {
    try {
      let collection = await _get_users_collection();
      let mongoObj = await collection
        .find({
          isPublic: true,
        })
        .toArray();
      return mongoObj;
    } catch (err) {
      throw err;
    }
  }

  /**
   * This methods deletes a WorkoutProgram from the workout-program collection given the WorkoutProgram ID
   * @param {String} workoutProgramID, ObjectID of the WorkoutProgram to be deleted, passed as a string
   * @returns {Boolean}, true or false depending on the outcome
   */
  static async deleteWorkoutProgram(workoutProgramID) {
    try {
      let collection = await _get_users_collection();
      let mongoObj = await collection.deleteOne({
        _id: ObjectId(workoutProgramID),
      });
      if (mongoObj.deletedCount == 1) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * This methods updates the attributes of a WorkoutProgram
   * @param {String} workoutProgramID, ObjectID of the WorkoutProgram to be updated, passed as a string
   * @param {int} newIsPublic, 0 if we want to set the WorkoutProgram to private, or 1 if want to set it public
   * @param {String} newNameOfProgram, name to update for the WorkoutProgram
   * @returns {Boolean}, true or false, depending on the outcome
   */
  static async updateWorkoutProgramDetails(
    workoutProgramID,
    newIsPublic,
    newNameOfProgram
  ) {
    let mongoObj;
    try {
      //first we update the visibility of the WorkoutProgram - whether it is private or public
      let collection = await _get_users_collection();
      if (newIsPublic != undefined) {
        if (newIsPublic == 0) {
          newIsPublic = false;
        } else {
          newIsPublic = true;
        }
        //update the attribute of the WorkoutProgram object in the collection
        mongoObj = await collection.updateOne(
          { _id: ObjectId(workoutProgramID) },
          {
            $set: {
              isPublic: newIsPublic,
            },
          }
        );
      }
      //now we update the name of the WorkoutProgram in the collection

      if (newNameOfProgram != undefined) {
        mongoObj = await collection.updateOne(
          { _id: ObjectId(workoutProgramID) },
          {
            $set: {
              nameOfProgram: newNameOfProgram,
            },
          }
        );
      }

      if (mongoObj.modifiedCount == 1) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * This methods allow us to add Exercise to a WorkoutProgram
   * @param {String} workoutProgramID, ObjectID of the WorkoutProgram, passed as a string
   * @param {int} exerciseID, the id of the Exercise to add to the WorkoutProgram
   * @param {int} numSets, the number of sets for that exercise
   * @param {int} numReps, the number of reps(repetitions) for that exercise
   * @returns {Boolean}, true or false, depending on the outcome
   */
  static async addExerciseToWorkoutProgram(
    workoutProgramID,
    exercise,
    numSets,
    numReps
  ) {
    let mongoObj;
    try {
      let collection = await _get_users_collection();
      //query the collection for the workoutProgramID and then append the new exercise details to the exercises array

      mongoObj = await collection.updateOne(
        { _id: ObjectId(workoutProgramID) },
        {
          $push: {
            exercises: {
              exercise: exercise,
              numSets: numSets,
              numReps: numReps,
            },
          },
        }
      );
      if (mongoObj.modifiedCount == 1) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * This methods allow us to remove an Exercise from a WorkoutProgram
   * @param {String} workoutProgramID, ObjectID of the WorkoutProgram, passed as a string
   * @param {int} exerciseID, the Exercise to remove from the WorkoutProgram
   * @returns {Boolean}, true or false, depending on the outcome
   */

  static async removeExerciseFromWorkoutProgram(workoutProgramID, exerciseID) {
    let mongoObj;
    try {
      let collection = await _get_users_collection();
      //query the WorkoutProgram collection for the workoutProgramID, and then query its exercise attribute(list) to remove the exercise with exerciseID.

      mongoObj = await collection.updateOne(
        { _id: ObjectId(workoutProgramID) },
        {
          $pull: {
            exercises: {
              "exercise.id": exerciseID,
            },
          },
        }
      );
      if (mongoObj.modifiedCount == 1) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * This methods returns all the WorkoutProgram created by a particular user
   * @param {ObjectId} userID, the id of the User ????????????????
   * @returns {[WorkoutProgram]} mongoObj, an array of all the WorkoutPrograms belonging to the user
   */

  static async getWorkoutProgramsByUser(userID) {
    let mongoObj;
    try {
      let collection = await _get_users_collection();
      mongoObj = await collection.find({ createdBy: userID }).toArray();
      return mongoObj;
    } catch (err) {
      throw err;
    }
  }
}

module.exports.WorkoutProgram = WorkoutProgram;
