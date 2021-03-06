
var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , User = mongoose.model('User');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
    function(username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Unknown user' });
        if (!user.authenticate(password, user.salt)) return done(null, false, { message: 'Invalid password' });
        return done(null, user);
      });
    }
  ));
}
