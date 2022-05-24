/**
 * @author Tejus Revi, Mahek Parmar
 * @version 1.0
 * Date: March 13, 2022
 * This script acts as the controller for the user object
 * We carry out several operations on the user object,
 * using the functionalities provided by this script.
 *
 */
var path = require("path");
let passwordHash = require("password-hash");
const User = require("../model/user.js").User;
const validator = require("../utils/validate-fields.js");

/**
 * Retrieves a user object from mongodb using the _id primary key
 * @param {*} req 
 * @param {*} res 
 */
module.exports.getUserByID = async (req, res) => {
  let userID = req.user.user._id;
  res.send(await User.getUserByID(userID));
};

/**
 * Adds a new local user to the database. A local user is a user who has signed up for the application using Local Authentication Strategy, ie using email and password stored in our database.
 * @param {*} req 
 * @param {*} res 
 */
module.exports.addLocal = async (req, res) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let msg = {};

  let isFormValid = validator.validUserInfo(username, email, password);
  if (isFormValid.valid) {
    let hashedPassword = passwordHash.generate(password);
    let new_user = new User(true, username, email, hashedPassword);
    let userInserted = await new_user.save();
    if (userInserted) {
      msg = {
        success: true,
        message:
          "User " + username + " was correctly inserted to the database.",
      };
    } else {
      msg = {
        success: false,
        message: "Email address already exists. Try logging in.",
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
 * A function that deletes a user provided the user id
 * @param {*} req
 * @param {*} res
 */
module.exports.deleteUser = async (req, res) => {
  let userID = req.user.user._id;
  let wasDeleted = await User.deleteUser(userID);
  let msg = {};

  if (wasDeleted) {
    msg = {
      success: true,
      message: "User was deleted.",
    };
    req.logout();
  } else {
    msg = {
      success: false,
      message: "User was not deleted.",
    };
  }
  res.send(msg);
};

/**
 * A function that updates the user primary/core details
 * @param {*} req
 * @param {*} res
 */
module.exports.updateUser = async (req, res) => {
  let userID = req.user.user._id;
  //parameters for this function are provided via the request body
  let newUsername = req.body.username;
  let newPassword = req.body.password;

  let msg = {};
  let hashedNewPassword;

  let isUserValid = validator.validUserInfo(
    newUsername,
    req.user.user.email,
    newPassword
  );

  if (isUserValid.valid) {
    if (req.user.user.isLocal) {
      hashedNewPassword = passwordHash.generate(newPassword); //storing the hashed password
      let wasUpdated = await User.updateUser(
        //calling updateUser method of User
        userID,
        newUsername,
        hashedNewPassword
      );
      if (wasUpdated) {
        req.logout(); //updating the core information logs the user out
        msg = {
          success: true,
          message: "User was updated.",
        };
      }
    } else {
      msg = {
        success: false,
        message: "User doesn't use local authentication.",
      };
    }
  } else {
    msg = {
      success: false,
      message: isUserValid.errorMessage,
    };
  }
  res.send(msg);
};

/**
 * A function that updates the user secondary details
 * @param {*} req
 * @param {*} res
 */

module.exports.updatePersonalInformation = async (req, res) => {
  let userID = req.user.user._id;
  //parameters to do so are passed via the request body
  let age = req.body.age;
  let gender = req.body.gender;
  let height = req.body.height;
  let weight = req.body.weight;
  let goalWeight = req.body.goalWeight;
  let msg = {};
  let isPersonalInfoValid = validator.validPersonalInfo(
    age,
    gender,
    height,
    weight,
    goalWeight
  );

  if (isPersonalInfoValid.valid) {
    let wasUpdated = await User.updatePersonalInfo(
      //updating the user's seconday info if valid
      userID,
      age,
      gender,
      height,
      weight,
      goalWeight
    );

    if (wasUpdated) {
      msg = {
        success: true,
        message: "User was updated.",
      };
    } else {
      msg = {
        success: false,
        message: "User was not updated.",
      };
    }
  } else {
    msg = {
      success: false,
      message: isPersonalInfoValid.errorMessage,
    };
  }
  res.send(msg);
};

/**
 * A function that logs the user out
 * @param {*} req
 * @param {*} res
 */

module.exports.logout = async (req, res) => {
  req.logout();
  res.send({
    success: true,
    message: "Successfully logged out.",
  });
};
