
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

var Client = mongoose.model('Client');

/**
 * Index
 * GET /clients
 */

exports.index = function (req, res) {
  Q.ninvoke(Client.index, 'find')
    .then(function (clients) {
      res.locals.clients = clients;
      return res.render('clients');
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
 * GET /clients/new
 */

exports.new = function (req, res) {
  Q.fcall(function () {
    var clients = req.flash('client');
    return ( clients && clients.length && clients[clients.length-1] ? clients[clients.length-1] : new Client() );
  })
    .then(function (client) {
      res.locals.client = client;
      return res.render('clients/new', { 
        pageHeading: 'Create Client'
      });
    })
    .fail(function (err) {
      return res.render('500');
    });
}

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
 