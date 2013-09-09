
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

var ErrorLog = mongoose.model('ErrorLog')
  , User = mongoose.model('User')
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
      var _obj = _.omit( ( obj && obj._doc ? obj._doc : obj ) , '_id', 'user');
      _objKeys = Object.keys(_obj);
      _objKeys.forEach(function (key) {
        _obj[key] = stripMongoIds(_obj[key]);
      });
    }
    return _obj;
  }
  res.locals.stripMongoIds = stripMongoIds;

  /**
   * Returns an alphabetically-sorted array that ignores 'the' and is case-insensitive
   *
   * @param {Array} array
   * @param {String} sortField - the name of the field against which the sort will occur
   * @returns {Array} An alpha-ordered array
   */
  toAlphaSortedArray = function (array, sortField) {
    if (!sortField) sortField = 'title';
    return array.sort(function (a, b) {
      var _a = a[sortField].toLowerCase().match(/(the\s|^)(.*)/);
      var _b = b[sortField].toLowerCase().match(/(the\s|^)(.*)/);
      return _a[2].localeCompare(_b[2]);
    });
  }
  res.locals.toAlphaSortedArray = toAlphaSortedArray

  /**
   * Returns a stable numerically-sorted array
   *
   * @param {Array} array - An array that contains a position field (not nested)
   * @param {String} sortField - the name of the field against which the sort will occur
   * @returns {Array} Return an array sorted by its position field
   */
  toNumericSortedArray = function (array, sortField) {
    if (!sortField) sortField = 'position';
    return _.sortBy(array, sortField);
  }
  res.locals.toNumericSortedArray = toNumericSortedArray;

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

  /**
   * Returns an {Array} of Mongo/Mongoose validation error messages, or false {Boolean} if they do not exist in the Error object 
   *
   * @param {Error} err - An error object
   * @returns {Array|Boolean}
   */
  validationErrors = function (err) {
    if (err.name !== 'MongoError' && err.name !== 'ValidationError') return false;
    
    /** Mongo errors that we are catching (duplicate key) */
    if (err.code && ( err.code === 11000 || err.code === 11001 )) {
      if (!err.err) return false;
      var rawErr = err.err.match(/index:.*\.(.*)\.\$(.*)_.*dup\skey:\s{\s:\s"(.*)"/);
      if (!rawErr) return false;
      var dbCollection = rawErr[1];
      var collectionField = rawErr[2];
      var fieldValue = rawErr[3];
      return [ msg.notUnique(collectionField, fieldValue) ];
    }

    /** Mongoose validation errors */
    if (err.errors && typeof err.errors === 'object') {
      var _err = [];
      var objKeys = Object.keys(err.errors);
      objKeys.forEach(function (key) {
        _err.push(err.errors[key].type);
      });
      return _err;
    }

    /** no Mongo/Mongoose validation errors found */
    return false;
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
      req.flash('referer', req.url);
      return res.redirect('/users/login');
    }
    next();
  },
  requiresAdmin: function (req, res, next) {
    if (req.user.role != 'admin') {
      var _msg = msg.user.adminRequired(req.host + req.url);
      res.locals.errors = [_msg];
      var err = new Error(_msg);
      err.status = 403;
      return next(err);
    }
    next();
  },
  requiresSelf: function (req, res, next) {
    if (req.user.username != req.params.username && req.user.role != 'admin') {
      Q.ninvoke(User, 'findOne', { username: req.params.username })
        .then(function (_user) {
          if (!_user) {
            var _msg = msg.user.notFound(req.params.username, req.host + req.url);
            var err = new Error(_msg);
            err.status = 404;
            return next(err); // 404
          }
          var _msg = msg.user.selfRequired(req.params.username, req.host + req.url);
          res.locals.errors = [_msg];
          var err = new Error(_msg);
          err.status = 403;
          return next(err); // 403
        })
        .fail(function (err) {
          return next(err); // 500
        });
    }
    else next(); // self!
  }
}

/**
 * 404 handling
 */

exports.notFound = function (req, res, next) {
  /** create status object; set response status code */
  var status = {
    code: 404,
    msg: msg.status[404]
  }
  res.status(status.code);
  
  /** respond */
  if (req.accepts('html')) return res.render('status', { status: status }); // html
  if (req.accepts('json')) return res.send({ status: status }); // json
  return res.type('txt').send(status.msg); // text
}

/**
 * Error logging
 */

exports.errorLog = function (err, req, res, next) {

  /** record errors as mongoose-modeled documents */
  var errorLog = new ErrorLog({ 
    method: req.method,
    referer: req.headers.referer,
    stack: err.stack,
    status: err.status || 500,
    url: req.url,
    user: req.body._meta.userId
  });
  errorLog.save(function (err) {
    if (err) return next(err);
  });

  /** send to error handler */
  next(err);
}

/**
 * Error responding
 */

exports.errorRespond = function (err, req, res, next) {

  /** create status object; set response status code */
  var status = {
    code: err.status || 500,
    msg: msg.status[err.status] || msg.status[500]
  }
  res.status(status.code);

  /** respond */
  if (req.accepts('html')) return res.render('status', { status: status }); // html
  if (req.accepts('json')) return res.send({ status: status }); // json
  return res.type('txt').send(status.msg); // text
}
