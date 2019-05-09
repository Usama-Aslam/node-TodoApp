const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

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

UserSchema.methods.removeToken = function(token) {
  let user = this;

  return user.update({
    $pull: {
      tokens: {
        token: token
      }
    }
  });
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

UserSchema.statics.findByCredentials = function(body) {
  let User = this;
  return User.findOne({ email: body.email }).then(user => {
    if (!user) return Promise.reject();

    return new Promise((resolve, reject) => {
      bcrypt.compare(body.password, user.password, (err, res) => {
        if (res) {
          return resolve(user);
        } else reject();
      });
    });
  });
};

//--------------End-------------------

//------------Mongoose Middleware----------------
//use this function for any modification in user document.Here we used it to modify the password for hash
UserSchema.pre("save", function(next) {
  let user = this; //we get 'this' here because its running on a mongoose doc. so it automatically gets the doc

  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        // console.log("password hashed");
        next();
      });
    });
  } else {
    next();
  }
});
//---------------------------------------------
var User = mongoose.model("User", UserSchema);

module.exports = {
  User
};
