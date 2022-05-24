/*
 * This function calcualtes and updates the BMI  on the BMI panel on the Body Metrics page
 * @param {float} height of the user
 * @param {float} weight of the user
 */
function updateBMI(height, weight) {
  //caluclating the BMI on this reference
  // https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/healthy-weights/canadian-guidelines-body-weight-classification-adults/body-mass-index-nomogram.html
  let bmi =
    Math.round((weight / (((height / 100) * height) / 100)) * 100) / 100;
  //updates both the BMI value and the text aswell
  $("#bmi-number").text(bmi);
  if (bmi < 18.5) {
    $("#bmi-text").text("Your BMI classification is underweight");
  } else if (bmi > 18.5 && bmi < 24.9) {
    $("#bmi-text").text("Your BMI classification is normal weight");
  } else if (bmi > 25.0) {
    $("#bmi-text").text("Your BMI classification is overweight");
  }
}

/*
 * This function updates the weight goal for the user on the Body Metric Page
 * @param {float} weight, the weight of the user
 * @param {float} goalWeight, the goal weight of the user
 */
function updateGoal(weight, goalWeight) {
  //calculates how far behind or ahead the user is from their weight goal
  let diff = goalWeight - weight;

  $("#goal-number").text(Math.abs(diff) + " kgs");

  if (diff < 0) {
    $("#goal-text").text("over");
  } else {
    $("#goal-text").text("under");
  }
}

/*
 * This function updates the secondary information/metrics for the user on the Body Metrics page
 */
function updateMetrics() {
  //makes a GET request to get the currently logged in user
  $.ajax({
    url: "/user",
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      //shows the users current metric's on the said fields
      $("#age").text(response.personalInfo.age);
      $("#gender").text(response.personalInfo.gender).change();
      $("#height").text(response.personalInfo.height);
      $("#weight").text(response.personalInfo.weight);
      $("#goal-weight").text(response.personalInfo.goalWeight);

      if (response.personalInfo.height && response.personalInfo.weight) {
        $(".metrics-card").fadeIn();
        updateBMI(response.personalInfo.height, response.personalInfo.weight);
        updateGoal(
          response.personalInfo.weight,
          response.personalInfo.goalWeight
        );
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
  updateMetrics();
});

/*
 * Click event for the Edit button on the Body Metrics page
 */
$("#edit-body-metrics-button").click(function (event) {
  event.preventDefault();
  $("#body-metrics-alert-success").hide();
  $("#body-metrics-alert-danger").hide();
  //allows for users to edit
  $("#view-body-metrics").hide();
  $("#edit-body-metrics").show();
  //makes a GET request to get the currently logged in user
  $.ajax({
    url: "/user",
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      //sets the value of the text fields as the user's current info so users can know what it currently is
      $("#age-input").val(response.personalInfo.age);
      $("#gender-input").val(response.personalInfo.gender).change();
      $("#height-input").val(response.personalInfo.height);
      $("#weight-input").val(response.personalInfo.weight);
      $("#goal-weight-input").val(response.personalInfo.goalWeight);

      updateBMI(response.personalInfo.height, response.personalInfo.weight);
      updateGoal(
        response.personalInfo.weight,
        response.personalInfo.goalWeight
      );
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
});

/*
 * Saves the update Body Metrics for the user on the Body Metrics pagge
 */
$("#save-body-metrics-button").click(function (event) {
  event.preventDefault();
  $("#body-metrics-alert-success").hide();
  $("#body-metrics-alert-danger").hide();
  //at this point, the user has inputted their update metrics
  //goes back to view mode
  $("#view-body-metrics").show();
  $("#edit-body-metrics").hide();

  let bodyMetrics = {};
  //assembling a body metrics JSON with the updated metrics
  bodyMetrics.age = $("#age-input").val();
  bodyMetrics.gender = $("#gender-input").val();
  bodyMetrics.height = $("#height-input").val();
  bodyMetrics.weight = $("#weight-input").val();
  bodyMetrics.goalWeight = $("#goal-weight-input").val();

  //makes a PUT request to update the metrics/secondary info for the user
  $.ajax({
    url: "/user/personalInformation",
    type: "PUT",
    data: JSON.stringify(bodyMetrics),
    contentType: "application/json",
    success: function (response) {
      updateMetrics(); //calls to relfect the change
      $("#body-metrics-alert-success").text("Your information was updated");
      $("#body-metrics-alert-success").show();
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
});
