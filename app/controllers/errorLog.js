
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , Q = require('q');

/**
 * Models
 */

var ErrorLog = mongoose.model('ErrorLog');

/**
 * Index
 * GET /errorLog
 * GET /errorLog/json
 */

exports.index = function (req, res, next) {
  Q.ninvoke(ErrorLog.index, 'find')
    .then(function (errorLog) {
      res.locals.errorLog = errorLog;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(errorLog)); // json
      return res.render('errorLog'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}
