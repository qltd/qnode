
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Contact = mongoose.model('Contact');

/**
 * Index
 */

exports.index = function (req, res) {
  var contacts = req.flash('contact');
  var contact = ( contacts && contacts.length && contacts[contacts.length-1] ? contacts[contacts.length-1] : new Contact() );
  res.render('home', { 
    title: 'Q Design & Communication Since 1981', 
    onload: 'changevid()',
    information: req.flash('info'),
    successes: req.flash('success'),
    warnings: req.flash('warning'),
    errors: req.flash('error'),
    contact: contact
  });
};

/**
 * Index for admins
 */

exports.admin = function (req, res) {
  var contacts = req.flash('contact');
  var contact = ( contacts && contacts.length && contacts[contacts.length-1] ? contacts[contacts.length-1] : new Contact() );
  res.render('home/admin', { 
    title: 'Q Design & Communication Since 1981',
    onload: 'changevid()',
    information: req.flash('info'),
    successes: req.flash('success'),
    warnings: req.flash('warning'),
    errors: req.flash('error'),
    contact: contact
  });
};
