const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const { ObjectID } = require("mongodb");

const { mongoose } = require("./db/mongoose");
const { Todo } = require("./models/Todo");
const { User } = require("./models/User");

const { authenticate } = require("./middlewares/authenticate");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
  
app.post("/todos", authenticate, (req, res) => {
  const newTodo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  newTodo
    .save()
    .then(doc => {
      res.status(200).send(doc);
      console.log("Insert Successful:", doc);
    })
    .catch(e => res.status(400).send(e));
});

app.get("/todos", authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id })
    .then(todos => {
      res.status(200).send({ todos });
    })
    .catch(e => res.status(400).send(e));
});

app.get("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(404).send({ error: "Invalid Id" });

  Todo.findOne({ _id: id, _creator: req.user._id })
    .then(todo => {
      if (!todo) return res.status(404).send();

      res.status(200).send({ todo });
    })
    .catch(e => res.status(400).send(e));
});

app.delete("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(404).send({ error: "invalid Id" });

  Todo.findOneAndRemove({ _id: id, _creator: req.user._id })
    .then(todo => {
      if (!todo) return res.status(400).send({ error: "todo not found" });

      res.status(200).send({ todo });
    })
    .catch(e => res.status(400).send(e));
});

app.patch("/todos/:id", authenticate, (req, res) => {
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

  Todo.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: body },
    { new: true }
  )
    .then(todo => {
      if (!todo) return res.status(404).send({ error: "invalid id" });

      res.status(200).send({ todo });
    })
    .catch(e => res.status(400).send(e));
});

//Users Route

app.post("/users", (req, res) => {
  const body = _.pick(req.body, ["email", "password"]);
  const newUser = new User(body);

  newUser
    .save()
    .then(user => {
      return user.generateAuthToken();
    })
    .then(token => {
      // console.log("newUser", newUser);
      res
        .status(200)
        .header("x-auth", token)
        .send({ newUser });
    })
    .catch(e => res.status(400).send({ error: "invalid details" }));
});

//we used 2 parameter as middleware. authenticate middleware will be used for verification of user.Http don't know who is making request. we are telling server that a particular user has come and he has this token please verify it and complete his request
app.get("/users/me", authenticate, (req, res) => {
  //we have received a new req.user property from middleware authenticate.js.
  const user = req.user;
  res.status(200).send({ user });
});

app.post("/users/login", (req, res) => {
  const body = _.pick(req.body, ["email", "password"]);

  // res.send(body);
  User.findByCredentials(body)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res
          .status(200)
          .header("x-auth", token)
          .send(user);
      });
    })
    .catch(e => res.status(400).send());
});

app.delete("/users/me/token", authenticate, (req, res) => {
  //req.user returned from authentication.js
  req.user
    .removeToken(req.token) //instanceMethod
    .then(doc => {
      res.status(200).send(doc);
    })
    .catch(err => res.status(400).send());
});

app.listen(PORT, () => console.log(`Server Running at ${PORT}`));

module.exports = { app };
