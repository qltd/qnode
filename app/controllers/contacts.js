
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Contact = mongoose.model('Contact');

/**
 * Show contact response
 */

exports.show = function(req, res) {
  Contact.find({}, 'name email company comments', function (err, contacts) {
    if (err) return handleError(err);
    res.render('admin', { contacts: contacts });
  });
}

/**
 * Create contact response
 */

exports.create = function(req, res) {
  var contact = new Contact(req.body);
  contact.save();
  res.send(req.body);
}
