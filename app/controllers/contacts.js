
/**
 * Module dependencies
 */

var nodemailer = require('nodemailer')
  , mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , Q = require('q')
  , transport = nodemailer.createTransport('Sendmail')
  , utils = require('../../lib/utils');

/**
 * Models
 */

var Contact = mongoose.model('Contact');

/**
 * Index
 * GET /contacts
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
 * Create
 * POST /contacts/new
 */

exports.create = function (req, res) {
  var contact = new Contact(req.body);
  contact.save(function (err) {
    if (err) {
      req.flash('error', utils.errors(err));
      req.flash('contact', contact);
      return res.redirect('/');
    } else {
      var mailOptions = {
          from: 'web@qltd.com',
          to: 'web@qltd.com',
          subject: 'qltd.com: New Message for Q from ' + contact.name,
          text: 'From: ' + contact.name + ' (' + contact.email + ')\nCompany: ' + contact.company + '\nComments: ' + contact.comments
      }
      transport.sendMail(mailOptions);
      req.flash('success', msg.contact.created(contact.name));
      return res.redirect('/');
    }
  });
}
