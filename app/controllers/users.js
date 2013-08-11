
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Q = require('q')
  , _ = require('underscore');

/**
 * Model dependencies
 */

var User = mongoose.model('User');

/**
 * Other dependencies
 */

var message = require('../../config/messages.js')['user']
  , utils = require('../../lib/utils')

/**
 * Index
 * GET /users
 */

exports.index = function (req, res) {
  Q.ninvoke(User.index, 'find')
    .then(function (users) {
      res.locals.users = users;
      return res.render('users');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Show
 * GET /users/:username
 * GET /users/:username/log/:__v
 */

exports.show = function (req, res) {
  Q.ninvoke(User, 'findOne', { username: req.params.username })
    .then(function (user) {
      if (!user) return res.render('404');
      res.locals.user = ( req.params.__v && user.changeLog[req.params.__v] ? _.extend(user, user.changeLog[req.params.__v].data) : user );
      return res.render('users/show');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * New
 * GET /users/new
 */

exports.new = function (req, res) {
  Q.fcall(function () {
    var users = req.flash('user');
    return ( users && users.length && users[users.length-1] ? users[users.length-1] : new User() );
  })
    .then(function (user) {
      res.locals.user = user;
      return res.render('users/new', { 
        page_heading: 'Sign-up', 
        submit_button_title: 'Sign-up',
      });
    })
    .fail(function (err) {
      return res.render('500');
    });  
}

/**
 * Edit
 * GET /users/:username/edit
 */

exports.edit = function (req, res) {
  Q.ninvoke(User, 'findOne', { username: req.params.username })
    .then(function (user) {
      if (!user) return res.render('404');
      res.locals.user = user;
      return res.render('users/edit');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Create
 * POST /users/new 
 */

exports.create = function (req, res) {
  var user = new User(req.body);
  user.save(function(err) {
    if(err) {
      req.flash('error', utils.errors(err));
      req.flash('user', user);
      return res.redirect('/users/new');
    } else {
      req.flash('success', message.created(user.username));
      return res.redirect('/users');
    }
  });
}

/**
 * Update
 * POST /users/:username/edit
 */

exports.update = function (req, res) {
  Q.ninvoke(User, 'findOne', { username: req.params.username })
    .then(function (user) {
      if (!user) return res.render('404');
      user = _.extend(user, req.body);
      return Q.ninvoke(user, 'save');
    })
    .then(function () {
      req.flash('success', message.updated(req.body.username));
      return res.redirect('/users');
    })
    .fail(function (err) {
      req.flash('error', utils.errors(err));
      return res.redirect('/users/' + req.params.username + '/edit');
    });
}

/**
 * changeLog index
 * GET /users/:username/log
 */

exports.log = function (req, res) {
  Q.ninvoke(User.index, 'findOne', { username: req.params.username })
    .then(function (user) {
      if (!user) return res.render('404');
      res.locals.user = user;
      return res.render('users/log');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * changeLog restore
 * GET /users/:username/log/:__v/restore
 */

exports.restore = function (req, res) {
  Q.ninvoke(User.index, 'findOne', { username: req.params.username })
    .then(function (user) {
      if (!user) return res.render('404');
      data = _.omit(user.changeLog[req.params.__v].data, '__v');
      data._meta = req.body._meta;
      user = _.extend(user, data);
      return Q.ninvoke(user, 'save');
    })
    .then(function () {
      req.flash('success', message.updated(data.username));
      return res.redirect('/users');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/* * * * * * * * * *
 * Authentication  *
 * * * * * * * * * *
 * Below functions extend the user model for authentication
 */

/**
 * Login
 * GET /users/login
 */

exports.login = function (req, res) {
  res.render('users/login', { 
    page_heading: 'Login', 
    submit_button_title: 'Login',
    user: new User() 
  });
}

/**
 * Authenticate
 * POST /users/login
 */

exports.authenticate = function (req, res) {
  // THIS FOLLOWS passport.authenticate in /config/routes.js
  req.flash('success', message.authenticated(req.user.username));
  res.redirect('/');
} 

/**
 * Logout
 * GET /users/logout
 */

exports.logout = function (req, res) {
  req.session.destroy();
  res.redirect('/');
}
