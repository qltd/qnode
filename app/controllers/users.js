
/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['user']
  , mongoose = require('mongoose')
  , User = mongoose.model('User')
  , utils = require('../../lib/utils');

/**
* New user
*/

exports.new = function(req, res) {
  res.render('users/new', { 
    page_heading: 'Sign-up', 
    form_action: '/user/new', 
    submit_button_title: 'Sign-up',
    errors: req.flash('error'),
    user: function() {
      return (user ? user : new User());
    }
  });
}

/**
 * Create user 
 */

exports.create = function(req, res) {
  var user = new User(req.body);
  user.save(function(err) {
    if(err) {
      req.flash('error', utils.errors(err));
      return res.redirect('/user/new');
    } else {
      req.flash('success', 'Successfully added user: ' + req.body.username);
      return res.redirect('/');
    }
  });
}

/**
 * Show log-in form
 */

exports.login = function(req, res) {
  res.render('users/login', { 
    page_heading: 'Login', 
    form_action: '/user/login', 
    submit_button_title: 'Login',
    errors: req.flash('error'),
    user: new User() 
  });
}


/**
 * Index
 */

exports.index = function(req, res) {
  User.find({}, function (err, users) {
    if (err) return handleError(err);
    res.render('users', { users: users });
  });
}

exports.authenticated = function(req, res) {
  req.flash('success', 'Successfully logged in as ' + req.user.username);
  res.redirect('/admin');
} 
