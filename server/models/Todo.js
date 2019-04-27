const mongoose = require("mongoose");

var Todo = mongoose.model("Todos", {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

module.exports = { Todo };