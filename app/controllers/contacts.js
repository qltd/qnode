
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , Q = require('q');

/**
 * Models
 */

var Contact = mongoose.model('Contact');

/**
 * Index
 * GET /contacts
 * GET /contacts/json
 */

exports.index = function (req, res, next) {
  Q.ninvoke(Contact, 'find')
    .then(function (contacts) {
      res.locals.contacts = contacts;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(contacts)); // json
      return res.render('contacts'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Create
 * POST /contacts/new
 */

exports.create = function (req, res, next) {

  /** temporary drop-in for spam prevention */
  if (req.body.company === 'google') return res.redirect('/');
  
  var contact = new Contact(req.body);
  Q.ninvoke(contact, 'save')
    .then(function () {
      req.flash('success', msg.contact.created(contact.name));
      return res.redirect('/'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500
      req.flash('error', vErr);
      req.flash('contact', contact);
      return res.redirect('/'); // html
    });
}
