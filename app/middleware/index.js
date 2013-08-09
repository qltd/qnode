
/**
 * Module dependencies
 */

var mongoose = require('mongoose');

/**
 * Models
 */

var User = mongoose.model('User');

/**
 * Helpers
 */

exports.helpers = function(req, res, next) {

  // make flash messages available to views
  res.locals.information = req.flash('info');
  res.locals.successes = req.flash('success');
  res.locals.warnings = req.flash('warning');
  res.locals.errors = req.flash('error');

  // make session user available to views
  res.locals.sessionUser = req.user;

  // stores additional metadata within requests; puts it in req.body for ability to reference within mongoose modeled objects that are passed this parameter
  req.body._meta = {
    userId: ( req.user && req.user._id ? req.user._id : null )
  }
  // stores a copy of metadata in res
  res._meta = req.body._meta;

  // creates a named series of panel objects from a panel array
  // available to views as 'panel.Title.property' 
  res.locals.objectifyPanels = function(panels) {
    if (panels && panels.length) {
      var panelsObj = [];
      panels.forEach(function(panel) {
        panelsObj[panel.title] = panel;
      });
    }
    res.locals.panel = panelsObj;
    return panels;
  }

  res.locals.splitArray = function (mongoDocs) {
    return mongoDocs;
  }

  // accepts an array of mongo documents and returns html for a two-column list
  res.locals.renderTwoColumnList = function(mongoDocs) {
    if (mongoDocs.length == 0) return '';
    var html = ''
      , docCount = 0;
    mongoDocs.forEach(function (mongoDoc) {
      docCount++;
      if (docCount == 1) html = html.concat('<ul class=\'first\'>');
      if (docCount == 1 + mongoDocs.length / 2 || mongoDocs.length % 2 == 1 && docCount == 1.5 + mongoDocs.length / 2 ) html = html.concat('</ul><ul class=\'last\'>');
      html = html.concat('<li>' + mongoDoc.title + '<div class=\'flyout ' + ( docCount < 1 + mongoDocs.length / 2 ? 'fly-right' : 'fly-left' ) + '\'><h4>' + mongoDoc.title + '</h4><p>' + mongoDoc.body + '</p></div></li>');
    });
    html = html.concat('</ul>');
    return html;
  }

  // accepts an array of mongo documents and returns html for a list grid
  res.locals.renderGridList = function (mongoDocs) {
    if (mongoDocs.length == 0) return '';
    var html = ''
      , docCount = 0;
    return html;
  }

  // returns the date created of a mongo/mongoose object
  res.locals.dateCreated = function(mongoDoc) {
    return mongoDoc._id.getTimestamp();
  }

  // returns the date updated of a mongo/mongoose object
  res.locals.dateUpdated = function(mongoDoc) {
    return ( mongoDoc.changeLog[mongoDoc.changeLog.length - 1] && mongoDoc.changeLog[mongoDoc.changeLog.length - 1]._id ? mongoDoc.changeLog[mongoDoc.changeLog.length - 1]._id.getTimestamp() : mongoDoc._id.getTimestamp() );
  }

  // returns the username of the creator of a mongo/mongoose object
  res.locals.createdBy = function(mongoDoc) {
    return ( mongoDoc.changeLog[0] && mongoDoc.changeLog[0].user ? mongoDoc.changeLog[0].user : 'anonymous' );
  }

  // returns the username of the last updater of a mongo/mongoose object
  res.locals.updatedBy = function(mongoDoc) {
    return ( mongoDoc.changeLog[mongoDoc.changeLog.length - 1] && mongoDoc.changeLog[mongoDoc.changeLog.length - 1].user ? mongoDoc.changeLog[mongoDoc.changeLog.length - 1].user.username : 'anonymous' );
  }

  // returns a URL-safe string from a string
  toSlug = function(value) {
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
      req.flash('warning', 'This page requires authentication.');
      return res.redirect('/user/login');
    }
    next();
  }
}
