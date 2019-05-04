const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");

const { Todo } = require("../../models/Todo");
const { User } = require("../../models/User");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const todos = [
  {
    _id: new ObjectID(),
    text: "first todo"
  },
  {
    _id: new ObjectID(),
    text: "second todo",
    completed: true,
    completedAt: 33
  }
];

const users = [
  {
    _id: userOneId,
    email: "usama@gmail.com",
    password: "123123123",
    tokens: [
      {
        access: "auth",
        token: jwt.sign({ _id: userOneId, access: "auth" }, "123abc").toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: "aslam@gmail.com",
    password: "123123123"
  }
];

const populatedTodos = done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
};

const populatedUsers = done => {
  User.remove({})
    .then(() => {
      const userOne = new User(users[0]).save();
      const userTwo = new User(users[1]).save();

      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

module.exports = {
  todos,
  populatedTodos,
  users,
  populatedUsers
};
