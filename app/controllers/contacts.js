/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['contact']
  , mongoose = require('mongoose')
  , Q = require('q')
  , utils = require('../../lib/utils');

/**
 * Model dependencies
 */

var Contact = mongoose.model('Contact');

/**
 * Index
 */

exports.index = function (req, res) {
  Q.ninvoke(Contact, 'find')
    .then(function (contacts) {
      res.locals.contacts = contacts;
      return res.render('contacts');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Create contact
 */

exports.create = function (req, res) {
  var contact = new Contact(req.body);
  contact.save(function (err) {
    if (err) {
      req.flash('error', utils.errors(err));
      req.flash('contact', contact);
      return res.redirect('/');
    } else {
      req.flash('success', message.success(contact.name));
      return res.redirect('/');
    }
  });
}
