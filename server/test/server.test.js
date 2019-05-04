const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../Server");
const { Todo } = require("../models/Todo");
const { User } = require("../models/User");

const { todos, users, populatedTodos, populatedUsers } = require("./seed/seed");

beforeEach(populatedUsers);
beforeEach(populatedTodos);

describe("POST /todos", () => {
  it("should add a todo", done => {
    var text = "first test text";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should not create todo with Invalid data", done => {
    request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe("GET /todos", () => {
  it("should get all todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should return todo doc", done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("should return 404 if todo not found", done => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 for non-object ids", done => {
    request(app)
      .get(`/todos/123abc`)
      .expect(404)
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should remove a todo", done => {
    var hexId = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo.findById(hexId)
          .then(todo => {
            expect(todo).toNotExist();
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should return 404 if todo not found", done => {
    var hexId = new ObjectID().toHexString(); //we are searching with a different id
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(400)
      .end(done);
  });

  it("should return 404 if object id is not valid", done => {
    request(app)
      .delete("/todos/123abc")
      .expect(404)
      .end(done);
  });
});

describe("PATCH /todos/:id", () => {
  it("should update a todo", done => {
    var hexId = todos[0]._id.toHexString();
    var text = "its new todo";
    request(app)
      .patch(`/todos/${hexId}`)
      .send({ completed: true, text })
      .expect(200)
      .expect(res => {
        // console.log(res.body.todo);
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA("number");
      })
      .end(done);
  });

  it("should clear completedAt value when passed false", done => {
    var hexId = todos[1]._id.toHexString();
    var text = "its second new todo";
    request(app)
      .patch(`/todos/${hexId}`)
      .send({ completed: false, text })
      .expect(200)
      .expect(res => {
        // console.log(res.body.todo);
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe("GET /users/me", () => {
  it("should return user if authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.user._id).toBe(users[0]._id.toHexString());
        expect(res.body.user.email).toBe(users[0].email);
      })
      .end(done);
  });

  it("should return 401 if user is not authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", "lkflflsdsf")
      .expect(401)
      .expect(res => expect(res.body).toEqual({}))
      .end(done);
  });
});

describe("POST /users", () => {
  it("should create a user", done => {
    const obj = {
      email: "testemail@gmail.com",
      password: "123123123"
    };
    request(app)
      .post("/users")
      .send(obj)
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toExist();
        expect(res.body.newUser._id).toExist();
        expect(res.body.newUser.email).toBe(obj.email);
        // expect(res.body.newUser.password).toBe(obj.password);
      })
      .end(err => {
        if (err) return done(e);

        User.findOne({ email: obj.email }).then(doc => {
          expect(doc).toExist();
          expect(doc.password).toNotBe(obj.password);
          done();
        });
      });
  });

  it("should return validation error if request invalid", done => {
    const obj = {
      email: "and",
      password: "123"
    };
    request(app)
      .post("/users")
      .send(obj)
      .expect(400)
      .expect(res => {
        expect(res.body.error).toEqual("invalid details");
      })
      .end(done);
  });

  it("should not create email if already in use", done => {
    const obj = {
      email: users[0].email,
      password: "123123123"
    };
    request(app)
      .post("/users")
      .send(obj)
      .expect(400)
      .expect(res => {
        expect(res.body.error).toEqual("invalid details");
      })
      .end(done);
  });
});
