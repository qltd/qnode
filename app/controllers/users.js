
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , User = mongoose.model('User');

/**
 * Show log-in
 */

exports.login = function(req, res) {
  res.render('users/login');
}

 /**
 * Show sign-up
 */
 