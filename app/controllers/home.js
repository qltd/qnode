
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Contact = mongoose.model('Contact')
  , Panel = mongoose.model('Panel');

/**
 * Index
 */

exports.index = function (req, res) {
  var contacts = req.flash('contact');
  var contact = ( contacts && contacts.length && contacts[contacts.length-1] ? contacts[contacts.length-1] : new Contact() );
  var panels = Panel.find({ parentView: 'home' }, function (err, panels) {
    if (err) return handleError(err);
    return res.render('home', { 
      title: 'Q Design & Communication Since 1981', 
      onload: 'changevid()',
      panels: res.locals.objectifyPanels(panels),
      contact: contact
    });
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
    contact: contact
  });
};

