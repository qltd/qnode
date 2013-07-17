
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Contact = mongoose.model('Contact');

/**
 * Index
 */

exports.index = function(req, res) {
  Contact.find({}, function (err, contacts) {
    if (err) return handleError(err);
    res.render('contacts', { contacts: contacts });
  });
}

/**
 * Create
 */

exports.create = function(req, res) {
  var contact = new Contact(req.body);
  contact.save();
  res.send(req.body);
}
