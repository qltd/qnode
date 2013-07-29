/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['contact']
  , mongoose = require('mongoose')
  , Contact = mongoose.model('Contact')
  , utils = require('../../lib/utils');

/**
 * Index
 */

exports.index = function (req, res) {
  Contact.find({}, function (err, contacts) {
    if (err) return handleError(err);
    res.render('contacts', { contacts: contacts });
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
