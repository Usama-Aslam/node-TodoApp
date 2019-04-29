const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");

const { mongoose } = require("./db/mongoose");
const { Todo } = require("./models/Todo");
const { User } = require("./models/User");

const app = express();

app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  const newTodo = new Todo({
    text: req.body.text
  });
  newTodo
    .save()
    .then(doc => {
      res.status(200).send(doc);
      console.log("Insert Successful:", doc);
    })
    .catch(e => res.status(400).send(e));
});

app.get("/todos", (req, res) => {
  Todo.find()
    .then(todos => {
      res.status(200).send({ todos });
    })
    .catch(e => res.status(400).send(e));
});

app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(404).send({ error: "Invalid Id" });

  Todo.findById(id)
    .then(todo => {
      if (!todo) return res.status(404).send();

      res.status(200).send(todo);
    })
    .catch(e => res.status(400).send(e));
});

app.listen(3000, () => console.log("Server Running"));

module.exports = { app };
