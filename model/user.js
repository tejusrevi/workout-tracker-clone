/**
 * @author Tejus Revi, Mahek Parmar
 * @version 1.0
 * Date: March 13, 2022
 * This script models a user object and provides several methods which
 * represent its functionality and behaviour.
 */

const client = require("../utils/db.js");
const ObjectId = require("mongodb").ObjectId;
var passwordHash = require("password-hash");

/*
 * This method gets us the user collection from the mongoDb database
 * @return user collection
 */
async function _get_users_collection() {
  let db = await client.getDb();
  return await db.collection("user");
}

/*
 * The constructor to create a User object
 *
 */
class User {
  constructor(isLocal, username, email, password) {
    // Core user information. Any updates made to this information will logout the user
    this.isLocal = isLocal;
    this.username = username;
    this.email = email;
    this.password = password;

    // Secondary information. Any updates made to this information will not logout the user
    this.personalInfo = {
      age: null,
      gender: null,
      height: null,
      weight: null,
      goalWeight: null,
    };
  }

  /**
   * Saves the current instance of User class into exercise-tracker-db.user collection
   * @returns  If the user was correctly inserted, then the function returns true. Else, it returns false.
   */
  async save() {
    if (await User.emailDoesNotExists(this.email)) {
      try {
        let collection = await _get_users_collection();
        let mongoObj = await collection.insertOne(this);
        return true;
      } catch (err) {
        throw err;
      }
    } else {
      return false;
    }
  }

  /**
   * Returns a single user from the collection based on their user ID.
   * @param {String} userID, the ObjectId of the user, passed as a string
   * @returns {User} mongoObj, the User object
   */
  static async getUserByID(userID) {
    try {
      let collection = await _get_users_collection();
      let mongoObj = await collection.findOne({ _id: ObjectId(userID) });
      delete mongoObj.password;
      delete mongoObj.isLocal;
      return mongoObj;
    } catch (err) {
      throw err;
    }
  }
  /**
   * This function deletes a User provided the userID
   * @param {String} userID, the ObjectID of the user, passed as a String
   * @returns {Boolean} true or false, depending on outcome
   */
  static async deleteUser(userID) {
    try {
      let collection = await _get_users_collection();
      let mongoObj = await collection.deleteOne({ _id: ObjectId(userID) });
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
   * This function updates the users primary detailsD
   * @param {String} userID, the ObjectID of the user passes as a string
   * @param {String} newUsername, the new username for the user
   * @param {String} newPassword, the new password for the user
   * @returns {Boolean} true or false depending on whether the update was successful or not
   */
  static async updateUser(userID, newUsername, newPassword) {
    let mongoObj;
    try {
      let collection = await _get_users_collection();
      if (newUsername != undefined) {
        //first we update the username (if provided)
        mongoObj = await collection.updateOne(
          { _id: ObjectId(userID) },
          {
            $set: {
              username: newUsername,
            },
          }
        );
      }
      //then we update the password, if provided
      if (newPassword != undefined) {
        mongoObj = await collection.updateOne(
          { _id: ObjectId(userID) },
          {
            $set: {
              password: newPassword,
            },
          }
        );
      }
      if (mongoObj.modifiedCount >= 1) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * This function updates the users secondary details
   * @param {String} userID, the ObjectID of the user passes as a string
   * @param {int} age, the updated age for the user
   * @param {String} gender, the updated gender for the user
   * @param {} height, the updated height for the user
   * @param {weight}, the updated weight for the user
   * @param {goalWeight}, the updated goal/target weight for the user
   * @returns {Boolean} true or false depending on whether the update was successful or not
   */
  static async updatePersonalInfo(
    userID,
    age,
    gender,
    height,
    weight,
    goalWeight
  ) {
    //all the parameters are optional, if provided we update that attribute
    let mongoObj;
    let modified = false;
    try {
      let collection = await _get_users_collection(); //get the users collection
      if (age != undefined) {
        //first we update the age, if provided
        mongoObj = await collection.updateOne(
          { _id: ObjectId(userID) },
          {
            $set: {
              "personalInfo.age": parseInt(age),
            },
          }
        );
        if (mongoObj.modifiedCount == 1) {
          modified = true;
        }
      }
      if (gender != undefined) {
        //then the gender, if provided
        mongoObj = await collection.updateOne(
          { _id: ObjectId(userID) },
          {
            $set: {
              "personalInfo.gender": gender,
            },
          }
        );
        if (mongoObj.modifiedCount == 1) {
          modified = true;
        }
      }
      if (height != undefined) {
        //then the height, if provided
        mongoObj = await collection.updateOne(
          { _id: ObjectId(userID) },
          {
            $set: {
              "personalInfo.height": parseFloat(height),
            },
          }
        );
        if (mongoObj.modifiedCount == 1) {
          modified = true;
        }
      }
      if (weight != undefined) {
        //then the weight, if provided
        mongoObj = await collection.updateOne(
          { _id: ObjectId(userID) },
          {
            $set: {
              "personalInfo.weight": parseFloat(weight),
            },
          }
        );
        if (mongoObj.modifiedCount == 1) {
          modified = true;
        }
      }
      if (goalWeight != undefined) {
        //finally the goal weight, if provided
        mongoObj = await collection.updateOne(
          { _id: ObjectId(userID) },
          {
            $set: {
              "personalInfo.goalWeight": parseFloat(goalWeight),
            },
          }
        );
        if (mongoObj.modifiedCount == 1) {
          modified = true;
        }
      }

      if (modified) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * This function check if a user corresponding to the provided email address exists in the user collection or not
   * @param {String} email, the email address we are searching for
   * @returns {Boolean} true if no user with the provided email address was found, else false
   */
  static async emailDoesNotExists(email) {
    try {
      let collection = await _get_users_collection();
      let count = await collection.count({ email: email });
      if (count > 0) {
        return false;
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  /**
   * This method finds and returns the hashed password for the user represented by the email parameter, provided that the email address exists in the collection.
   * @param {*} email the email address we are searching for
   * @returns returns hashed password for the user with the given email address
   */
  static async getPasswordFor(email) {
    if (!(await User.emailDoesNotExists(email))) {
      try {
        let collection = await _get_users_collection();
        let mongoObj = await collection.findOne({ email: email });
        if (mongoObj) return mongoObj.password;
      } catch (err) {
        throw err;
      }
    }
  }

  /**
   * This function provides passport authentication middleware with information about the currently logged in user.
   * @param {*} email the email address we are searching for
   * @returns returns the user object represented by the email address
   */
  static async getUserDetails(email) {
    try {
      let collection = await _get_users_collection();
      let mongoObj = await collection.findOne({ email: email });
      return mongoObj;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Adds a non local User object into the database. A non local user is any user who has used Google Authentication to sign up.
   * For nonLocal users, their passwords are not saved in the user collection. However, the email address is stored to avoid the user from creating another account.
   * @param {*} username username of the user to be added
   * @param {*} email email of the user to be added
   */
  static async addNonLocal(username, email) {
    if (User.emailDoesNotExists(email)) {
      let new_user = new User(false, username, email, null);
      let msg = await new_user.save();
    }
  }

  /**
   * This function verifies if the password entered by the user matches the hashed password store in the user collection.
   * @param {*} email email address of the user, whose passwors needs to be verifies
   * @param {*} password password entered by the user
   * @returns 
   */
  static async authenticateUser(email, password) {
    if (passwordHash.verify(password, await User.getPasswordFor(email)))
      return true;
    return false;
  }
}

module.exports.User = User;
