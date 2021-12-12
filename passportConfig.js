const User = require("./app/model/user.js"); 
const bcrypt = require('bcryptjs')
const localStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;


module.exports = function (passport) {

  passport.use(
    new localStrategy((username, password, done) => {
      console.log("username" + username)
      User.findOne({ username: username }, (err, user) => {
        if (err) throw err;
        if (!user) return done(null, false);
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err;
          if (result === true) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      });
    })
  );

  passport.use(new GoogleStrategy({
    clientID: "13419081150-08pi1jtvtvvujlukp2a49lvi0fvie273.apps.googleusercontent.com",
    clientSecret: "eMdbIL2SF4Q8ykY2CQOCixGs",
    callbackURL: "http://localhost:4000/google/callback"
    //callbackURL: "http://localhost:3000/profile"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOne({ googleId: profile.id }, async (err, user) => {
      if (user){
        return cb(err, user);
      }
      if (!user) {
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
        });
        await newUser.save();
        return cb(err, user);;
      }
      
    });
  }
));

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    console.log("ok")
    done(null, user);
  });
};
