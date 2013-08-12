
/**
 * Module dependencies
 */

var fs = require('fs')
  , mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , Q = require('q')
  , utils = require('../../lib/utils')
  , _ = require('underscore');

/**
 * Models
 */

var Crew = mongoose.model('Crew');


/**
 * Index
 * GET /crew
 */

exports.index = function (req, res) {
  Q.ninvoke(Crew.index, 'find')
    .then(function (crew) {
      res.locals.crew = crew;
      return res.render('crew');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Show
 *
 */

/**
 * New
 *
 */

/**
 * Edit
 *
 */

/**
 * Create
 *
 */

/**
 * Update
 *
 */

/**
 * changeLog index
 *
 */

/**
 * changeLog restore
 *
 */
 