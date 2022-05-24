/*
* Function to execute when DOM is loaded
*/
$(document).ready(function () {
  //get the currently logged in user's credentials
  $.ajax({
    url: "/user",
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      //show the credentails (only username and password) in the said fields
      $("#email").text(response.email);
      $("#email-input").text(response.email);
      $("#username").text(response.username);
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
});

/*
* Register click event for the Edit button on the Accounts page
*
*/
$("#edit-account-button").click(function (event) {
  event.preventDefault();
  $("#account-alert-success").hide();
  $("#account-alert-danger").hide();
  //allows the account info to be editted
  $("#view-account").hide();
  $("#edit-account").show();

  //get the currently logged in user
  $.ajax({
    url: "/user",
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      $("#username-input").val(response.username);
    },
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("Error - " + errorMessage);
    },
  });
});

/*
* Registers click event for the Save button on the Account page
*/
$("#save-account-button").click(function (event) {
  event.preventDefault();
  $("#account-alert-success").hide();
  $("#account-alert-danger").hide();

  let updatedUser = {};
  //validates the provided information
  if ($("#username-input").val() != "" && $("#password-input").val()) {
    //sets the username and password based on the input provided in the said fields
    updatedUser.username = $("#username-input").val();
    updatedUser.password = $("#password-input").val();
    //makes a PUT request to update user credentials on server side
    $.ajax({
      url: "/user",
      type: "PUT",
      data: JSON.stringify(updatedUser),
      contentType: "application/json",
      success: function (response) {
        $("#account-alert-success").text(
          "Account updated. You will be logged out in 5 seconds"
        );
        $("#account-alert-success").show();
        $("#account-alert-danger").hide();
        //log out the user in 5 seconds
        setInterval(function () {
          window.location.replace("/");
        }, 3000);
      },
      error: function (xhr, status, error) {
        var errorMessage = xhr.status + ": " + xhr.statusText;
        alert("Error - " + errorMessage);
      },
    });
  } else {
    //the case where no input or invalid input were provided
    $("#account-alert-danger").text("Please enter a username and password.");
    $("#account-alert-danger").show();
  }
});

/*
* Register click event for Delete Account button on the Account page
*/
$("#confirm-account-delete").click(function (event) {
  //make an DELETE request to delete the currently logged in user's account
  $.ajax({
    url: "/user",
    type: "DELETE",
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
