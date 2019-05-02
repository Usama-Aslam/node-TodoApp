const { User } = require("../models/User");

//what ever route will call it in 2 parameter. they will receive 2 new properties. 'User' and 'token'
const authenticate = (req, res, next) => {
  //req,res are coming from that route.
  const token = req.header("x-auth");
  //we used model methods. made our custom method of findByToken.
  User.findByToken(token)
    .then(user => {
      if (!user) {
        return Promise.reject(); // when promise reject catch block runs. mean no auth
      }

      //we are modifying req object. adding 2 more properties. this properties will be available in req object. in app routes (req,res)
      req.user = user;
      req.token = token;
      //calling next() to move forward to next middleware. if it won't call our app won't run
      next();
    })
    .catch(err => res.status(401).send());
};

module.exports = {
  authenticate
};
