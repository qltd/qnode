
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , Q = require('q')
  , utils = require('../../lib/utils');

/**
 * Models
 */

var Contact = mongoose.model('Contact');

/**
 * Index
 * GET /contacts
 * GET /contacts/json
 */

exports.index = function (req, res) {
  Q.ninvoke(Contact, 'find')
    .then(function (contacts) {
      res.locals.contacts = contacts;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(contacts)); // json
      return res.render('contacts'); // html
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Create
 * POST /contacts/new
 */

exports.create = function (req, res) {
  var contact = new Contact(req.body);
  Q.ninvoke(contact, 'save')
    .then(function () {
      req.flash('success', msg.contact.created(contact.name));
      return res.redirect('/');
    })
    .fail(function (err) {
      req.flash('error', utils.errors(err));
      req.flash('contact', contact);
      return res.redirect('/');
    });
}
