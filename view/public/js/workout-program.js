let exercises;
let selectedID;

/*
 * This function identifies the chosen exercise from the suggestion panel
 * @param {HTML button} objButton, the exercise which was clicked.
 */
function handleSuggestionSelect(objButton) {
  $("#suggestion-container").empty();
  $("#add-exercise-search").val(objButton.innerHTML);
  selectedID = objButton.value;
}

/*
 * This fuction deals with showing modals when exercises are clicked from the suggestion box
 * @param {HTML button} objButton, the HTML button which was clicked
 */
function handleExerciseClick(objButton) {
  //recall that although exercise names appear as text on the front end, they are actually implemented
  //as a button, the button stores the exerciseID as its value

  //makes a GET request to get the exercise object which was selected, providing the exerciseID
  $.ajax({
    url: "/exercise/" + objButton.value,
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      //display the exercise realted information on the modal
      $("#exercise-name").text(response.name);
      $("#exercise-image").attr("src", response.gifUrl);
      $("#body-part").text(response.bodyPart);
      $("#equipment").text(response.equipment);
      $("#target-muscle").text(response.target);

      $("#exerciseInfoModal").modal("toggle");
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
}

/*
 * This fuction deals with deleting exercises from the workout program
 * @param {HTML button} objButton, the HTML delete button which was clicked
 */
function handleDelete(objButton) {
  $("#suggestion-container").empty();
  //getting the current workout program id from the end point
  let programID =
    window.location.pathname.split("/")[window.location.pathname.split.length];
  //recall that the delete button stores the exerciseID of the exercise it represents as its value

  //make a PUT request that removes the said exercise from the workout program
  $.ajax({
    url:
      "/workoutProgram/removeExercise/" +
      programID +
      "?exerciseID=" +
      objButton.value,
    type: "PUT",
    contentType: "application/json",
    success: function (response) {
      updateTable(); //update the table to reflect changes
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
}

/*
 * This function updates the suggestions on the suggestion box when the user searches for exercise
 * @param {[String]} list, the list containing all exercise names which match the users seatch input
 */
function updateSuggestions(list) {
  $("#suggestion-container").empty();
  list.forEach((element) => {
    //when any of the suggestion option is clicked we set it to the selectedID
    //although every exercise name in the suggestion box appears as text to the user, it is actually implemented as a button whose value = exerciseID of the exercise it represents
    $("#suggestion-container").append(`
    <button type="button" class="btn btn-link exercise-suggestion capitalize" value="${element.id}" onclick="handleSuggestionSelect(this)">${element.name}</button>
    `);
  });
}

/*
 * A simple function which updates the workout programs detail on the Workout program page
 * @ param {WorkoutProgram} response, a WorkoutProgram object
 */
function updateWorkoutProgramInfo(response) {
  $("#name-of-program").text(response.nameOfProgram);
  $("#name-side-panel").text(response.nameOfProgram);
  $("#is-public-side-panel").text(response.isPublic ? "Public" : "Private");
}

/*
 * This function updates the table which displays the exercises of the workout program
 */
function updateTable() {
  //intially set it to empty
  $("#exercise-table-body").empty();
  //get the current workout program's id from the end point
  let programID =
    window.location.pathname.split("/")[window.location.pathname.split.length];
  //make a GET reqeuest to get the workout program given its id
  $.ajax({
    url: "/workoutProgram/" + programID,
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      updateWorkoutProgramInfo(response); //update info on the workout program page
      response.exercises.forEach((element) => {
        //add every exercise in the workout program to the table along with the reps and sets
        //the exercise names are implemented as buttons where the value of the button = exercise ID of the exercise they represent
        //the value of the delete button is also the exerciseID of the exercise it represents
        $("#exercise-table-body").append(
          `
          <tr>
          <td>
            <button type="button" class="btn btn-link capitalize" value=${element.exercise.id} onclick="handleExerciseClick(this)">
              ${element.exercise.name}
            </button>
          </td>
          <td>${element.numSets}</td>
          <td>${element.numReps}</td>
          <td>
            <button type="button" class="btn btn-danger capitalize" value="${element.exercise.id}" onclick="handleDelete(this)">
              <i class="bi bi-trash-fill"></i>Delete
            </button>
          </td>
        </tr>
          `
        );
      });
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
}

/*
 * Function to execute when DOM is loaded
 */
$(document).ready(function () {
  updateTable();
  //GET request to get all the exercises
  $.ajax({
    url: "/exercise",
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      exercises = response;
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
});

/*
 * Registers keyup events for everytime characters are added/removed from #add-exercise-search input box
 */
$("#add-exercise-search").on("keyup", function () {
  var value = $(this).val().toLowerCase();
  if (value.length > 1) {
    let filteredList = exercises.filter((element) => {
      return element.name.includes(value);
    });

    updateSuggestions(filteredList);
  } else {
    $("#suggestion-container").empty();
  }
});

/*
 * Registers click event for the Add button when adding exericses to the workout program
 */
$("#add-exercise").click(function (event) {
  event.preventDefault();
  //need to make sure that none of the required fields are null
  if (
    $("#sets-input").val() != "" &&
    $("#reps-input").val() != "" &&
    selectedID != null
  ) {
    //assemble data of the exercise to be added
    let exerciseData = {};
    exerciseData.exerciseID = selectedID;
    exerciseData.numSets = $("#sets-input").val();
    exerciseData.numReps = $("#reps-input").val();
    //get the programID from the endpoint
    let programID =
      window.location.pathname.split("/")[
        window.location.pathname.split.length
      ];
    //PUT request to insert exercise to the workout program
    $.ajax({
      url: "/workoutProgram/addExercise/" + programID,
      type: "PUT",
      data: JSON.stringify(exerciseData),
      contentType: "application/json",
      success: function (response) {
        updateTable(); //updates the table to reflect the addition
        $("#addNewExercise").modal("toggle");
        $("#add-exercise-search").val("");
        $("#sets-input").val("");
        $("#reps-input").val("");
      },
      error: function (xhr, status, error) {
        var errorMessage = xhr.status + ": " + xhr.statusText;
        alert("Error - " + errorMessage);
      },
    });
  } else {
    alert("Please fill in all details");
  }
});

/*
 * Registers click event for the Edit button when editing a workout program details
 */
$("#edit-program-info").click(function (event) {
  event.preventDefault();
  //allow for updating info
  $("#view-side-panel").hide();
  $("#edit-side-panel").show();
});

/*
 * Registers click event for the Save button when editing a workout program details
 */
$("#save-program-info").click(function (event) {
  event.preventDefault();
  let workoutProgram = {};
  //assembles the above workoutProgram JSON with the updated name and visibility
  if ($("#name-side-panel-input").val() != "") {
    workoutProgram.nameOfProgram = $("#name-side-panel-input").val();
    if ($("#is-public-side-panel-input").prop("checked")) {
      workoutProgram.isPublic = 1;
    } else {
      workoutProgram.isPublic = 0;
    }
    //gets the current workoutprogram ID based on the endpoint
    let programID =
      window.location.pathname.split("/")[
        window.location.pathname.split.length
      ];
    //makes a PUT request that updates the workout program details on the server
    $.ajax({
      url: "/workoutProgram/" + programID,
      type: "PUT",
      data: JSON.stringify(workoutProgram),
      contentType: "application/json",
      success: function (response) {
        updateTable(); //reflects changes
        //back to view mode
        $("#view-side-panel").show();
        $("#edit-side-panel").hide();
      },
      error: function (xhr, status, error) {
        var errorMessage = xhr.status + ": " + xhr.statusText;
        alert("Error - " + errorMessage);
      },
    });
  } else {
  }
});
