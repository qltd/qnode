
/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['user']
  , mongoose = require('mongoose')
  , Q = require('q')
  , utils = require('../../lib/utils');

var User = mongoose.model('User');

/**
 * Index
 */

exports.index = function (req, res) {
  Q.ninvoke(User, 'find')
    .then(function (users) {
      res.locals['users'] = users;
      return res.render('users');
    })
    .fail(function (err) {
      return handleError(err);
    });
}

/**
* New user
*/

exports.new = function (req, res) {
  Q.fcall(function () {
    var users = req.flash('user');
    return ( users && users.length && users[users.length-1] ? users[users.length-1] : new User() );
  })
    .then(function (user) {
      res.locals['user'] = user;
      return res.render('users/new', { 
        page_heading: 'Sign-up', 
        form_action: '/user/new', 
        submit_button_title: 'Sign-up',
      });
    })
    .fail(function (err) {
      return handleError(err);
    });  
}

/**
 * Create user 
 */

exports.create = function (req, res) {
  var user = new User(req.body);
  user.save(function(err) {
    if(err) {
      req.flash('error', utils.errors(err));
      req.flash('user', user);
      return res.redirect('/user/new');
    } else {
      req.flash('success', message.created(user.username));
      return res.redirect('/');
    }
  });
}

/**
 * Log-in form
 */

exports.login = function (req, res) {
  res.render('users/login', { 
    page_heading: 'Login', 
    form_action: '/user/login', 
    submit_button_title: 'Login',
    user: new User() 
  });
}

/**
 * Authentication
 */

exports.authenticated = function (req, res) {
  req.flash('success', message.authenticated(req.user.username));
  res.redirect('/admin');
} 
