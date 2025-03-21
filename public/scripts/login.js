function togglePassword() {
    var element = $("#password")[0];
    if (element.type === "password") {
        element.type = "text";
    } else {
        element.type = "password";
    }
  }