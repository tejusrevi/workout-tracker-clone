var emailValidator = require("email-validator");

var errorMessage;

/**
 * Validator to verify if correct user informtion was provided.
 * Information is valid if
 * 1. username is neither empty nor undefined
 * 2. email is neither empty, nor undefined nor invalid format
 * 3. password is neither empty nor undefined
 * @param {*} username username to verify
 * @param {*} email email to verify
 * @param {*} password password to verify
 * @returns true if information is valid. Else false
 */
module.exports.validUserInfo = (username, email, password) => {
  errorMessage = [];
  if (validUsername(username) & validEmail(email) & validPassword(password)) {
    return { valid: true };
  } else {
    return { valid: false, errorMessage: errorMessage };
  }
};

/**
 * Validator for personalInfo object within User
 * Information is valid if
 * 1. age is not a NAN
 * 2. gender is either male, female or other
 * 3. height is not a NAN
 * 4. weight is not a NAN
 * 5. goalWeight is not a NAN
 * @param {*} age age to verify
 * @param {*} gender gender to verify
 * @param {*} height height to verify
 * @param {*} weight weight to verify
 * @param {*} goalWeight gol weight to verify
 * @returns
 */
module.exports.validPersonalInfo = (
  age,
  gender,
  height,
  weight,
  goalWeight
) => {
  errorMessage = [];
  if (
    validAge(age) &
    validGender(gender) &
    validHeight(height) &
    validWeight(weight) &
    validGoalWeight(goalWeight)
  ) {
    return { valid: true };
  } else {
    return { valid: false, errorMessage: errorMessage };
  }
};

/**
 * Validator to verify if correct WorkoutProgram information was provided
 * Information is valid if
 * 1. isPublic is defined, and is either of 0 or 1
 * 2. nameOfProgram is defined, and is not empty
 * @param {*} isPublic isPublic flag to verify
 * @param {*} nameOfProgram nameOfProgram to verify
 * @returns
 */
module.exports.validWorkoutProgramInfo = (isPublic, nameOfProgram) => {
  errorMessage = [];
  if (validIsPublic(isPublic) & validNameOfProgram(nameOfProgram)) {
    return { valid: true };
  } else {
    return { valid: false, errorMessage: errorMessage };
  }
};

//Verifies if username is valid. True if valid, else false
validUsername = (username) => {
  if (username == "" || username == undefined) {
    errorMessage.push("Please enter an username");
    return false;
  }
  return true;
};

// Verifies if email is valid. True if valid, else false
validEmail = (email) => {
  if (email == "" || email == undefined) {
    errorMessage.push("Please enter an email address");
    return false;
  }
  if (!emailValidator.validate(email)) {
    errorMessage.push("Invalid email address");
    return false;
  }
  return true;
};

//Verifies if password is valid. True if valid, else false
validPassword = (password) => {
  if (password == "" || password == undefined) {
    errorMessage.push("Please enter a password");
    return false;
  }
  return true;
};

//Verifies if age is valid. True if valid, else false
validAge = (age) => {
  if (isNaN(age)) {
    errorMessage.push("Age must be a valid number");
    return false;
  }
  return true;
};

//Verifies if gender is valid. True if valid, else false
validGender = (gender) => {
  if (gender != "male" && gender != "female" && gender != "other") {
    errorMessage.push("Illegal value for gender");
    return false;
  }
  return true;
};

//Verifies if height is valid. True if valid, else false
validHeight = (height) => {
  if (isNaN(height)) {
    errorMessage.push("Height must be a valid number");
    return false;
  }
  return true;
};

//Verifies if weight is valid. True if valid, else false
validWeight = (weight) => {
  if (isNaN(weight)) {
    errorMessage.push("Weight must be a valid number");
    return false;
  }
  return true;
};

//Verifies if goalWeight is valid. True if valid, else false
validGoalWeight = (goalWeight) => {
  if (isNaN(goalWeight)) {
    errorMessage.push("Goal Weight must be a valid number");
    return false;
  }
  return true;
};

//Verifies if isPublic is valid. True if valid, else false
validIsPublic = (isPublic) => {
  if ((isPublic != "0" && isPublic != "1") || isPublic == undefined) {
    errorMessage.push("Invalid value for isPublic");
    return false;
  }
  return true;
};

//Verifies if nameOfProgram is valid. True if valid, else false
validNameOfProgram = (nameOfProgram) => {
  if (nameOfProgram == "" || nameOfProgram == undefined) {
    errorMessage.push("Name of Program cannot be empty");
    return false;
  }
  return true;
};
