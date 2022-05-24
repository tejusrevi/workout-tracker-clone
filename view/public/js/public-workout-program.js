/*
* This fuction deals with showing modals when exercises are clicked from the suggestion box
* @param {HTML button} objButton, the HTML button which was clicked
*/
function handleExerciseClick(objButton){
  //recall that although exercise names appear as text on the front end, they are actually implemented
  //as a button, the button stores the exerciseID as its value

  //makes a GET request to get the exercise object which was selected, providing the exerciseID
  $.ajax({
    url: "/exercise/" + objButton.value,
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      //display the exercise realted information on the modal
      $('#exercise-name').text(response.name);
      $('#exercise-image').attr("src",response.gifUrl);
      $('#body-part').text(response.bodyPart);
      $('#equipment').text(response.equipment);
      $('#target-muscle').text(response.target);

      $('#exerciseInfoModal').modal('toggle')
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
}

/*
 * This function updates the table containing exercises in the Public Workout program view page
 */
function updateTable() {
  //initailly set to empty
  $("#exercise-table-body").empty();
  //get the workout program id via the end point variable
  let programID =
    window.location.pathname.split("/")[window.location.pathname.split.length];
  //make a GET request and get the selected workout program
  $.ajax({
    url: "/workoutProgram/" + programID,
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      //add every exercise in the program to the table
      //exercise names are implemented as buttons, which when clicked display a modal showing the exercise
      $("#name-of-program").text(response.nameOfProgram);
      response.exercises.forEach((element) => {
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
});
