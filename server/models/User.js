const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const secret = "123abc";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    default: null,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email"
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [
    {
      access: { type: String, required: true },
      token: { type: String, required: true }
    }
  ]
});

//--------------Instance Methods-------------------

//we are overriding the existing method of mongoose to display
UserSchema.methods.toJSON = function() {
  const user = this;
  //converting mongoose document into object so that we can get values from object
  const userObject = user.toObject();

  //returning only email and id from the document
  return _.pick(userObject, ["_id", "email"]);
};

//for generating token and sending to users header
UserSchema.methods.generateAuthToken = function() {
  let user = this;
  const access = "auth";

  const token = jwt.sign({ _id: user._id.toHexString(), access }, secret);
  user.tokens.push({ token, access });

  return user.save().then(doc => token);
};

//--------------End-------------------

//--------------Model Methods-------------------

UserSchema.statics.findByToken = function(token) {
  let User = this;
  // console.log(token);
  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (error) {
    return Promise.reject({ error: "invalid token" });
  }

  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

//--------------End-------------------

var User = mongoose.model("User", UserSchema);

module.exports = {
  User
};
