const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/TodoApp", {
    useNewUrlParser: true
  })
  .then(() => console.log("=======mongodb connect=====", process.env.MONGO_URI))
  .catch(e => console.log("unable to connect"));

module.exports = {
  mongoose
};
