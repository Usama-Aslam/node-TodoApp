const mongoose = require("mongoose");

var User = mongoose.model("User", {
  email: {
    type: String,
    required: true,
    trim: true,
    default: null,
    minlength: 1
  }
});

module.exports = {
  User
};
