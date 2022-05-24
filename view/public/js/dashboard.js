var exercises = [];

var searchBarInput = "";
var bodyPartInput = "none";
var equipmentInput = "none";
var targetMuscleInput = "none";

var listOfBodyParts = [];
var listOfTargetMuscles = [];
var listOfEquipments = [];

/*
* Execute when DOM is fully loaded
*/
$(document).ready(function () {
  $.ajax({
    //a GET request to get all the exercises from the exercise collection
    url: "/exercise",
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      exercises = response;
      //get all the possible types of body part, target muscles and equipment available
      exercises.forEach((exercise) => {
        if (!listOfBodyParts.includes(exercise.bodyPart)) {
          listOfBodyParts.push(exercise.bodyPart);
        }
        if (!listOfTargetMuscles.includes(exercise.target)) {
          listOfTargetMuscles.push(exercise.target);
        }
        if (!listOfEquipments.includes(exercise.equipment)) {
          listOfEquipments.push(exercise.equipment);
        }
      });
      //add them as options to the respective select boxes
      listOfBodyParts.forEach((bodyPart) => {
        $("#body-part-select").append(`<option class="capitalize" value="${bodyPart}">${bodyPart}</option>`);
      });
      listOfEquipments.forEach((equipment) => {
        $("#equipment-select").append(`<option class="capitalize" value="${equipment}">${equipment}</option>`);
      });
      listOfTargetMuscles.forEach((targetMuscle) => {
        $("#target-muscle-select").append(`<option class="capitalize" value="${targetMuscle}">${targetMuscle}</option>`);
      });
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
});
/*
* This function updates the modal for the selected exercise
* @param {int} exerciseID, id of the exercise
*/
function updateModal(exerciseID) {
  //make a GET request to get details of the selected exercise
  $.ajax({
    url: "/exercise/" + exerciseID,
    type: "GET",
    contentType: "application/json",
    success: function (response) {
    //update the modal accordingly
      $("#exercise-name").text(response.name);
      $("#exercise-image").attr("src", response.gifUrl);
      $("#body-part").text(response.bodyPart);
      $("#equipment").text(response.equipment);
      $("#target-muscle").text(response.target);
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
}

/*
* This function handles when an exercise is selected from the suggestion box
* @param {HTML button} objButton, the exercise name buttonw which was clicked
*/
function handleSuggestionSelect(objButton) {
  $("#exerciseInfoModal").modal("toggle");
  //update the modal based on the exercise wbutton hich was selected
  //recall that the button value = exerciseId.
  updateModal(objButton.value);
}

/*
* This function adds the suggested exercises to the suggestion box
* @param {[Exercise]} list, an array that contains all exercises that match the users selection
*/
function updateSuggestions(list) {
  $("#search-bar-suggestion-container").empty();
  //every exercise is added to the suggestion container as a button whose value represents the id of its respective exercise
  list.forEach((element) => {
    $("#search-bar-suggestion-container").append(`
    <button type="button" class="btn btn-link exercise-suggestion capitalize" value="${element.id}" onclick="handleSuggestionSelect(this)">${element.name}</button>
    `);
  });
}

/*
* Event handler when the selected options on the filtered exercise search change
*/
$(".filter").on("change", function () {
  if (this.id == "body-part-select") {
    bodyPartInput = this.value;
  } else if (this.id == "equipment-select") {
    equipmentInput = this.value;
  } else if (this.id == "target-muscle-select") {
    targetMuscleInput = this.value;
  }
  //filter the exercises based on the new selections
  filterExercises()
});

/**
 * Registers keyup event for when a character is added/removed from #search-bar input box
 */
$("#search-bar").on("keyup", function () {
  $("#filters").show();
  searchBarInput = $(this).val().toLowerCase();
  if (searchBarInput.length > 1) {
    filterExercises();
  } else {
    $("#search-bar-suggestion-container").empty();
  }
});

/*
* Click event for the "Body Metrics" button on the dashboard navigation panel
*/
$("#home-nav").click(function (event) {
  //hides all other views/pages, shows only the home page/view
  event.preventDefault();
  $("#home").fadeIn();
  $("#body-metrics").hide();
  $("#account").hide();
  $("#about").hide();

  $(".link-dark").removeClass("active");
  $("#home-nav").addClass("active");
});

/*
* Click event for the "Body Metrics" button on the dashboard navigation panel
*/
$("#body-metrics-nav").click(function (event) {
  //hides all other views/pages, shows the Body Metrics page/view
  event.preventDefault();
  $("#home").hide();
  $("#body-metrics").fadeIn();
  $("#account").hide();
  $("#about").hide();

  $(".link-dark").removeClass("active");
  $("#body-metrics-nav").addClass("active");
});

/*
* Click event for the "Account" button on the dashboard navigation panel
*/
$("#account-nav").click(function (event) {
  //hides all the other views/pages, shows the Account view/page
  event.preventDefault();
  $("#home").hide();
  $("#body-metrics").hide();
  $("#account").fadeIn();
  $("#about").hide();

  $(".link-dark").removeClass("active");
  $("#account-nav").addClass("active");
});

/*
* Click event for the "About" button on the dashboard navigation panel
*/
$("#about-nav").click(function (event) {
  //hides all the other view/pages, shows the About view/page
  event.preventDefault();
  $("#home").hide();
  $("#body-metrics").hide();
  $("#account").hide();
  $("#about").fadeIn();

  $(".link-dark").removeClass("active");
  $("#about-nav").addClass("active");
});

$("#close-suggestions").click(function (event) {
  $("#search-bar-suggestion-container").empty();
  $("#filters").hide();
});

/*
* Click event for the "Log out" button on the dashboard navigation panel
*/
$("#logout").click(function (event) {
  //makes a GET request, logs the user out  
  $.ajax({
    url: "/logout",
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      window.location.replace("/");
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
});

/*
* Filters the exercises and updates the suggestions
*/
function filterExercises() {
  let filteredList = exercises.filter((element) => {
    let nameMatch = element.name.includes(searchBarInput);

    let bodyPartMatch = true;
    let equipmentMatch = true;
    let targetMuscleMatch = true;

    if (bodyPartInput != 'none'){
      bodyPartMatch = bodyPartInput == element.bodyPart;
    }
    if (equipmentInput != 'none'){
      equipmentMatch = equipmentInput == element.equipment;
    }
    if (targetMuscleInput != 'none'){
      targetMuscleMatch = targetMuscleInput == element.target;
    }
    return nameMatch && bodyPartMatch && equipmentMatch && targetMuscleMatch;
  });
  updateSuggestions(filteredList);
}
