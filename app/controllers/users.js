
/**
 * Module dependencies
 */

var crypto = require('crypto')
  , mongoose = require('mongoose')
  , User = mongoose.model('User');

/**
* New user
*/

exports.new = function(req, res) {
  res.render('users/new');
}

/**
 * Create user 
 */

exports.create = function(req, res) {
  var user = new User(req.body);
  user.password = crypto.createHmac("sha512", req.body.username)
    .update(req.body.password)
    .digest("base64");
  user.save();
  res.redirect('/');
}

/**
 * Show log-in form
 */

exports.login = function(req, res) {
  res.render('users/login');
}

/**
 * Authenticate
 */

exports.authenticate = function(req, res) {
  var hash = crypto.createHmac("sha512", req.body.username)
    .update(req.body.password)
    .digest("base64");
  res.send(hash);
}
