
/**
 * Module dependencies
 */

var crypto = require('crypto')
  , mongoose = require('mongoose')
  , User = mongoose.model('User');

/**
 * Show log-in
 */

exports.login = function(req, res) {
  res.render('users/login');
}

/**
 * Authenticate
 */

exports.authenticate = function(req, res) {
  res.send(req.body);
}

/**
* Show sign-up
*/


 