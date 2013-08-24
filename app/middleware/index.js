
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , _ = require('underscore');

/**
 * Models
 */

var User = mongoose.model('User')
  , Image = mongoose.model('Image');

/**
 * Helpers
 */

exports.helpers = function (req, res, next) {

  /** makes flash messages available to views */
  res.locals.information = req.flash('info');
  res.locals.successes = req.flash('success');
  res.locals.warnings = req.flash('warning');
  res.locals.errors = req.flash('error');

  /** makes session user available to views */
  res.locals.sessionUser = req.user;

  /** stores additional metadata within requests; puts it in req.body for ability to reference within mongoose modeled objects that are passed this parameter */
  req.body._meta = {
    userId: ( req.user && req.user._id ? req.user._id : null ),
    userRole: ( req.user && req.user.role ? req.user.role : null )
  }
  res.locals._meta = req.body._meta;

  /**
   * Returns the username of the user who created a mongoDoc
   *
   * @param {Object} mongoDoc
   * @returns {String}
   */
  authorCreated = function (mongoDoc) {
    return ( mongoDoc.changeLog[0] && mongoDoc.changeLog[0].user ? mongoDoc.changeLog[0].user.username : 'anonymous' );
  }
  res.locals.authorCreated = authorCreated;

  /**
   * Returns the username of the user who last updated a mongoDoc
   *
   * @param {Object} mongoDoc
   * @returns {String}
   */
  authorUpdated = function (mongoDoc) {
    return ( mongoDoc.changeLog[mongoDoc.changeLog.length - 1] && mongoDoc.changeLog[mongoDoc.changeLog.length - 1].user ? mongoDoc.changeLog[mongoDoc.changeLog.length - 1].user.username : 'anonymous' );
  }
  res.locals.authorUpdated = authorUpdated;

  /**
   * Returns the time and date a mongoose-modeled object was created
   *
   * @param {Object} mongoDoc
   * @returns {String}
   */
  dateCreated = function (mongoDoc) {
    return mongoDoc._id.getTimestamp();
  }
  res.locals.dateCreated = dateCreated;

  /**
   * Returns the time and date a mongoDoc was last updated
   *
   * @param {Object} mongoDoc
   * @returns {String}
   */
  dateUpdated = function (mongoDoc) {
    return ( mongoDoc.changeLog[mongoDoc.changeLog.length - 1] && mongoDoc.changeLog[mongoDoc.changeLog.length - 1]._id ? mongoDoc.changeLog[mongoDoc.changeLog.length - 1]._id.getTimestamp() : mongoDoc._id.getTimestamp() );
  }
  res.locals.dateUpdated = dateUpdated;

  /**
   * Removes Mongo and user identifiers from objects and arrays
   *
   * @param {Object|Array} obj - Any object or array
   * @returns {Object|Array} An object or array that has been stripped of mongo and user identifiers
   */
  stripMongoIds = function (obj) {
    if (typeof obj !== 'object') return obj;
    if (_.isArray(obj)) { // is Object Array
      var _obj = [];
      obj.forEach(function (o, key) {
        _obj.push(stripMongoIds(o));
      });
    } else { // is Object
      var _obj = _.omit( ( obj._doc ? obj._doc : obj ) , '_id', 'user');
      _objKeys = Object.keys(_obj);
      _objKeys.forEach(function (key) {
        _obj[key] = stripMongoIds(_obj[key]);
      });
    }
    return _obj;
  }
  res.locals.stripMongoIds = stripMongoIds;

  /**
   * Converts an array of mongoose-modeled objects into an object containing multiple mongoose-modeled objects with camel-case keys that are generated from their slugs or titles
   *
   * @param {Array} mongoDocs - An array of mongoose-modeled objects
   * @returns {object} An object containing multiple mongoose-modeled objects with camel-case keys that are generated from their slugs or titles
   */  
  toCamelKeyObject = function (mongoDocs) {
    var _mongoDocs = {};
    mongoDocs.forEach(function (mD, key) {
      var _mD = mD['_doc'];
      if (!_mD.slug) _mD.slug = toSlug(_mD.title);
      var _mDKeyParts = _mD.slug.split('-');
      var _mDKey = '';
      _mDKeyParts.forEach(function (kP, k) {
        if (k === 0) _mDKey += kP;
        else _mDKey += kP.charAt(0).toUpperCase() + kP.slice(1);
      });
      _mongoDocs[_mDKey] = _mD;
    });
    return _mongoDocs;
  }
  res.locals.toCamelKeyObject = toCamelKeyObject;

  /**
   * Returns a URL-safe value from another value
   *
   * @param {String} value
   * @returns {String} URL-safe value
   */
  toSlug = function (value) {
    return value.toLowerCase().replace(/[ |_]/g, '-').replace(/[^\w-]+/g,'');
  }
  res.locals.toSlug = toSlug;

  /**
   * Converts a single array in to an array-containing array that holds the halves of the original array within two keys
   *
   * @param {Array} array - A valid javascript array
   * @returns {Array} An array containing the original array in two halves, referenced by keys '0' and '1'
   */
  toSplitArray = function (array) {
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
  res.locals.toSplitArray = toSplitArray;

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
