
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , _ = require('underscore');

/**
 * Models
 */

var User = mongoose.model('User');

/**
 * Helpers
 */

exports.helpers = function (req, res, next) {

  // make flash messages available to views
  res.locals.information = req.flash('info');
  res.locals.successes = req.flash('success');
  res.locals.warnings = req.flash('warning');
  res.locals.errors = req.flash('error');

  // make session user available to views
  res.locals.sessionUser = req.user;

  // stores additional metadata within requests; puts it in req.body for ability to reference within mongoose modeled objects that are passed this parameter
  req.body._meta = {
    userId: ( req.user && req.user._id ? req.user._id : null ),
    userRole: ( req.user && req.user.role ? req.user.role : null )
  }
  // stores a copy of metadata in res
  res._meta = req.body._meta;

  // creates a named series of panel objects from a panel array
  // available to views as 'panel.Title.property' 
  objectifyPanels = function (panels) {
    if (panels && panels.length) {
      var panelsObj = [];
      panels.forEach(function(panel) {
        panelsObj[panel.title] = panel;
      });
    }
    res.locals.panel = panelsObj;
    return panels;
  }
  res.locals.objectifyPanels = objectifyPanels;

  // splits arrays in half, with odd divisions populating an additional value in the first half
  // accepts: [ {}, {}, {}, {}, {} ]
  // returns: [ [ {}, {}, {} ] , [ {}, {} ] ] 
  splitArray = function (array) {
    if (array.length < 2)  return [array,[]];
    firstHalfKeys = _.range(Math.round(array.length / 2));
    secondHalfKeys = _.range(Math.round(array.length / 2), array.length);
    firstHalfArray = [];
    secondHalfArray = [];
    firstHalfKeys.forEach(function (key) {
      firstHalfArray.push(array[key]);
    });
    secondHalfKeys.forEach(function (key) {
      secondHalfArray.push(array[key]);
    });
    return [ firstHalfArray, secondHalfArray ];
  }
  res.locals.splitArray = splitArray;

  // returns the date created of a mongo/mongoose object
  dateCreated = function (mongoDoc) {
    return mongoDoc._id.getTimestamp();
  }
  res.locals.dateCreated = dateCreated;

  // returns the date updated of a mongo/mongoose object
  dateUpdated = function (mongoDoc) {
    return ( mongoDoc.changeLog[mongoDoc.changeLog.length - 1] && mongoDoc.changeLog[mongoDoc.changeLog.length - 1]._id ? mongoDoc.changeLog[mongoDoc.changeLog.length - 1]._id.getTimestamp() : mongoDoc._id.getTimestamp() );
  }
  res.locals.dateUpdated = dateUpdated;

  // returns the username of the creator of a mongo/mongoose object
  createdBy = function (mongoDoc) {
    return ( mongoDoc.changeLog[0] && mongoDoc.changeLog[0].user ? mongoDoc.changeLog[0].user : 'anonymous' );
  }
  res.locals.createdBy = createdBy;

  // returns the username of the last updater of a mongo/mongoose object
  updatedBy = function (mongoDoc) {
    return ( mongoDoc.changeLog[mongoDoc.changeLog.length - 1] && mongoDoc.changeLog[mongoDoc.changeLog.length - 1].user ? mongoDoc.changeLog[mongoDoc.changeLog.length - 1].user.username : 'anonymous' );
  }
  res.locals.updatedBy = updatedBy;

  // returns a URL-safe string from a string
  toSlug = function (value) {
    return value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g,'');
  }

  next();
}

/**
 * Authorization
 */

exports.authorization = {
  requiresLogin: function (req, res, next) {
    if (!req.isAuthenticated()) {
      req.flash('warning', msg.user.authenticationRequired(req.host + req.url));
      return res.redirect('/users/login');
    }
    next();
  },
  requiresAdmin: function (req, res, next) {
    if (!req.user) res.render('500');
    if (req.user.role != 'admin') {
      req.flash('error', msg.user.adminRequired(req.host + req.url));
      return res.redirect(( req.headers.referer ? req.headers.referer : '/' ));
    }
    next();
  },
  requiresAuthor: function (req, res, next) {
    if (!req.user) res.render('500');
    if (req.user.username != req.params.username && req.user.role != 'admin') {
      req.flash('error', msg.user.authorRequired(req.host + req.url));
      return res.redirect(( req.headers.referer ? req.headers.referer : '/' ));
    }
    next();
  }
}
