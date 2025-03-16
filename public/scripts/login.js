function togglePassword() {
    var element = $("#password")[0];
    if (element.type === "password") {
        element.type = "text";
    } else {
        element.type = "password";
    }
  }

$(document).ready(function() {
    $("#rememberMe").change(function() {
        if ($(this).is(":checked")) {
            $("#login").attr("action", "/login");
        } else {
            $("#login").attr("action", "/loginNoSave");
        }
    });
});