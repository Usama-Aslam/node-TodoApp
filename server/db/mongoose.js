const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/TodoApp", { useNewUrlParser: true })
  .then(() => console.log("=======mongodb connect====="))
  .catch(e => console.log("unable to connect"));

module.exports = {
  mongoose
};
