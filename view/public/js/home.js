/*
* This function deletes a workout program which is owned by the currently logged in user. 
* @param {HTML Button} objButton, the delete button which was clicked
*/
function deleteProgram(objButton) {
  //recall that the delete button contains the id of the workout program which it represents
  //make a DELETE request to delete the workout program given the workoutProgramID
  $.ajax({
    url: "/workoutProgram/" + objButton.value,
    type: "DELETE",
    contentType: "application/json",
    success: function (response) {
      getWorkoutProgramsByUser();         //updates the list of workout programs
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
}

/*
* This function gets all the workout programs owned by the currently logged in user and displays them on the home page
*/
function getWorkoutProgramsByUser() {
  //make a GET request to get all the workour programs made by the currently logged in user
  $.ajax({
    url: "/user/workoutprograms",
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      //the case where the user has created no workout programs
      $("#programs-by-user").empty();
      if (response.length == 0) {
        $("#programs-by-user").text("You do not have any programs created");
      } else {
        response.forEach((element) => {
          //add every workout program accrodingly under the "Your Programs" label
          $("#programs-by-user").append(
            `<div class="card workout-program-card" style="width: 15rem; overflow: hidden">\
              <div class="workout-program-thumb" style="height: 150px; background-image: url(/images/thumbnail/thumb${ element._id[element._id.length - 1].charCodeAt(0) % 7 }.png); background-size:cover; background-repeat:no-repeat; background-position: center center;" ></div>\
              <div class="card-body">\
                <h5 class="card-title program-name">${
                  element.nameOfProgram
                }</h5>\
                <p class="card-text program-link" style="font-size: small; opacity: 0.9;">${
                  element.isPublic ? "Public" : "Private"
                }</p>\
                <a href="/workout-program/${
                  element._id
                }" target="_blank" class="btn btn-primary">View</a>\
                <button class="btn btn-danger" value=${
                  element._id
                } onclick="deleteProgram(this)">Delete</button>\
              </div>\
            </div>`
          );

        });
      }
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
}
/*
* Execute when DOM is fully loaded
*/
$(document).ready(function () {
  //get the currently logged in user via a GET request
  $.ajax({
    url: "/user",
    type: "GET",
    contentType: "application/json",
    success: function (response) {
    //display the greeeting based on the user's username
      $("#greeting-username").text(response.username);
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });

  getWorkoutProgramsByUser();     //called to add all the programs owned by the user

  //make another GET request to get all the 'public' workoutprograms
  $.ajax({
    url: "/workoutprogram",
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      //display all of the public workout programs under the "Programs by Community Members" section
      //an a-tag is implemented, so whenever View is clicked it takes the user to a new page showing the public workout program details
      response.forEach((element) => {
        $("#public-programs").append(
          `<div class="card workout-program-card" style="width: 15rem;">\
          <div class="workout-program-thumb" style="height: 150px; background-image: url(/images/thumbnail/thumb${ element._id[element._id.length - 1].charCodeAt(0) % 7 }.png); background-size:cover; background-repeat:no-repeat; background-position: center center;" ></div>\
              <div class="card-body">\
                <h5 class="card-title program-name">${element.nameOfProgram}</h5>\
                <a href="/workout-program/${element._id}" target="_blank" class="btn btn-primary">View</a>\
              </div>\
            </div>`
        );
      });
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
});

/*
* Registers click event for the "Add new" button on the home page which adss a new workout program
*/
$("#add-new-program").click(function (event) {
  event.preventDefault();

  let workoutProgram = {};

  //some validation and then assembing the above workoutProgram JSON
  if ($("#name-of-program-input").val() != "") {
    workoutProgram.nameOfProgram = $("#name-of-program-input").val();
    if ($("#is-public-input").prop("checked")) {
      workoutProgram.isPublic = 1;
    } else {
      workoutProgram.isPublic = 0;
    }
    //making  a POST request to add the new workout program to the workout-program collection
    $.ajax({
      url: "/workoutProgram",
      type: "POST",
      data: JSON.stringify(workoutProgram),
      contentType: "application/json",
      success: function (response) {
        getWorkoutProgramsByUser();     //shwo the newly added program on home screen
        $("#addNewWorkoutProgram").modal("hide");         //hide the modal for making a new workout program
      },
      error: function (xhr, status, error) {
        var errorMessage = xhr.status + ": " + xhr.statusText;
        alert("Error - " + errorMessage);
      },
    });
  }
});
