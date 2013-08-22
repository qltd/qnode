
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
   * Converts an array of mongoDocs into an object-contained series of camelKeyed mongoDocs
   * @param {object[]} mongoDocs
   * @returns {object}  
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
   * Converts a single array in to an array-containing array that has half of its children in either of two keys
   * @param {object[]} array
   * @returns {object[]}  
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

  /**
   * Returns the time and date a mongoDoc was created
   * @param {object} mongoDoc
   * @returns {string}
   */
  dateCreated = function (mongoDoc) {
    return mongoDoc._id.getTimestamp();
  }
  res.locals.dateCreated = dateCreated;

  /**
   * Returns the time and date a mongoDoc was last updated
   * @param {object} mongoDoc
   * @returns {string}
   */
  dateUpdated = function (mongoDoc) {
    return ( mongoDoc.changeLog[mongoDoc.changeLog.length - 1] && mongoDoc.changeLog[mongoDoc.changeLog.length - 1]._id ? mongoDoc.changeLog[mongoDoc.changeLog.length - 1]._id.getTimestamp() : mongoDoc._id.getTimestamp() );
  }
  res.locals.dateUpdated = dateUpdated;

  /**
   * Returns the username of the user who created a mongoDoc
   * @param {object} mongoDoc
   * @returns {string}
   */
  createdBy = function (mongoDoc) {
    return ( mongoDoc.changeLog[0] && mongoDoc.changeLog[0].user ? mongoDoc.changeLog[0].user.username : 'anonymous' );
  }
  res.locals.createdBy = createdBy;

  /**
   * Returns the username of the user who last updated a mongoDoc
   * @param {object} mongoDoc
   * @returns {string}
   */
  updatedBy = function (mongoDoc) {
    return ( mongoDoc.changeLog[mongoDoc.changeLog.length - 1] && mongoDoc.changeLog[mongoDoc.changeLog.length - 1].user ? mongoDoc.changeLog[mongoDoc.changeLog.length - 1].user.username : 'anonymous' );
  }
  res.locals.updatedBy = updatedBy;

  /**
   * Returns a URL-safe value from another value
   * @param {string} value
   * @returns {string}
   */
  toSlug = function (value) {
    return value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g,'');
  }

  /**
   * Returns a mongoDoc after stripping it of its '_id' and 'user' keys and values
   * @param {object} mongoDoc
   * @returns {object}
   */
  stripObjectId = function (mongoDoc) {
    var _mongoDoc = _.omit(mongoDoc, '_id', 'user');
    return _mongoDoc;
  }

  /**
   * Returns a stripped mongoDoc from a mongoDoc
   * @param {object} mongoDoc
   * @returns {object}
   */
  stripObject = function (mongoDoc) {
    var _mongoDoc = ( mongoDoc['_doc'] ? stripObjectId(mongoDoc['_doc']) : stripObjectId(mongoDoc) );
    var _mongoDocKeys = Object.keys(_mongoDoc);
    _mongoDocKeys.forEach(function (key) {
      if (typeof _mongoDoc[key] === 'object') {
        if (_.isArray(_mongoDoc[key])) {
          var _mDs = [];
          _mongoDoc[key].forEach(function (mD, k) {
            _mDs.push( ( mD['_doc'] ? stripObject(mD['_doc']) : stripObject(mD) ) );
          });
          _mongoDoc[key] = _mDs;
        } else {
          _mongoDoc[key] = ( _mongoDoc[key]['_doc'] ? stripObject(_mongoDoc[key]['_doc']) : stripObject(_mongoDoc[key]) );
        } 
      } 
    });
    return _mongoDoc;
  }

  /**
   * Returns an array of stripped mongoDocs from an array of mongoDocs
   * @param {object[]} mongoDocs
   * @returns {object[]}
   */
  stripObjects = function (mongoDocs) {
    var _mongoDocs = [];
    mongoDocs.forEach(function (mD, key) {
      var _mD = stripObject(mD['_doc']);
      _mongoDocs.push(_mD);
    });
    return _mongoDocs; 
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
