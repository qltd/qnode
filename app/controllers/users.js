
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , Q = require('q')
  , _ = require('underscore');

/**
 * Models
 */

var User = mongoose.model('User');

/**
 * Index
 * GET /users
 * GET /users/json
 */

exports.index = function (req, res, next) {
  Q.ninvoke(User.index, 'find')
    .then(function (users) {
      res.locals.users = users;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(users)); // json
      return res.render('users'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Show
 * GET /users/:username
 * GET /users/:username/json
 * GET /users/:username/log/:__v
 * GET /users/:username/log/:__v/json
 */

exports.show = function (req, res, next) {
  Q.ninvoke(User, 'findOne', { username: req.params.username })
    .then(function (user) {
      if (!user) return next(); // 404
      res.locals.user = ( req.params.__v && user.changeLog[req.params.__v] ? _.extend(user, user.changeLog[req.params.__v].data) : user );
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(res.locals.user)); // json
      return res.render('users/show'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * New
 * GET /users/new
 */

exports.new = function (req, res, next) {
  Q.fcall(function () {
    var users = req.flash('user');
    return ( users && users.length && users[users.length-1] ? users[users.length-1] : new User() );
  })
    .then(function (user) {
      res.locals.user = user;
      return res.render('users/new', { 
        page_heading: 'Sign-up', 
        submit_button_title: 'Sign-up',
      }); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });  
}

/**
 * Edit
 * GET /users/:username/edit
 */

exports.edit = function (req, res, next) {
  Q.ninvoke(User, 'findOne', { username: req.params.username })
    .then(function (user) {
      if (!user) return next(); // 404
      res.locals.user = user;
      return res.render('users/edit'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Create
 * POST /users/new 
 */

exports.create = function (req, res, next) {
  var user = new User(req.body);
  Q.ninvoke(user, 'save')
    .then(function () {
      req.flash('success', msg.user.created(user.username));
      return res.redirect('/users'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500
      req.flash('error', vErr);
      req.flash('user', user);
      return res.redirect('/users/new'); // html
    });
}

/**
 * Update
 * POST /users/:username/edit
 */

exports.update = function (req, res, next) {
  Q.ninvoke(User, 'findOne', { username: req.params.username })
    .then(function (user) {
      if (!user) return next(); // 404
      user = _.extend(user, req.body);
      return Q.ninvoke(user, 'save');
    })
    .then(function () {
      req.flash('success', msg.user.updated(req.body.username));
      return res.redirect('/users'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500
      req.flash('error', vErr);
      return res.redirect('/users/' + req.params.username + '/edit'); // html
    });
}

/**
 * changeLog index
 * GET /users/:username/log
 */

exports.log = function (req, res, next) {
  Q.ninvoke(User.index, 'findOne', { username: req.params.username })
    .then(function (user) {
      if (!user) return next(); // 404
      res.locals.user = user;
      return res.render('users/log'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * changeLog restore
 * GET /users/:username/log/:__v/restore
 */

exports.restore = function (req, res, next) {
  Q.ninvoke(User.index, 'findOne', { username: req.params.username })
    .then(function (user) {
      if (!user) return next(); // 404
      data = _.omit(user.changeLog[req.params.__v].data, '__v');
      data._meta = req.body._meta;
      user = _.extend(user, data);
      return Q.ninvoke(user, 'save');
    })
    .then(function () {
      req.flash('success', msg.user.restored(data.username, req.params.__v));
      return res.redirect('/users'); // html
    })
    .fail(function (err) {
      return next(err); // 500
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
  var referers = req.flash('referer');
  var referer = ( referers && referers[referers.length-1] ? referers[referers.length-1] : '/' );
  req.flash('success', msg.user.authenticated(req.user.username));
  res.redirect(referer);
} 

/**
 * Logout
 * GET /users/logout
 */

exports.logout = function (req, res) {
  req.session.destroy();
  res.redirect('/');
}
