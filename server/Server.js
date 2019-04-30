const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const { ObjectID } = require("mongodb");

const { mongoose } = require("./db/mongoose");
const { Todo } = require("./models/Todo");
const { User } = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

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

      res.status(200).send({ todo });
    })
    .catch(e => res.status(400).send(e));
});

app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(404).send({ error: "invalid Id" });

  Todo.findByIdAndRemove(id)
    .then(todo => {
      if (!todo) return res.status(400).send({ error: "todo not found" });

      res.status(200).send({ todo });
    })
    .catch(e => res.status(400).send(e));
});

app.patch("/todos/:id", (req, res) => {
  const id = req.params.id;

  const body = _.pick(req.body, ["text", "completed"]);

  if (!ObjectID.isValid(id))
    return res.status(404).send({ error: "invalid id" });

  if (_.isBoolean(body.completed) && body.completed) {
    body.completed = true;
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then(todo => {
    if (!todo) return res.status(404).send({ error: "invalid id" });

    res.status(200).send({ todo });
  });
});

app.listen(PORT, () => console.log(`Server Running at ${PORT}`));

module.exports = { app };
