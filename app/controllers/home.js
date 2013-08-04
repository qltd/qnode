
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Q = require('q');

/**
 * Model dependencies
 */

var Contact = mongoose.model('Contact')
  , Panel = mongoose.model('Panel')
  , Project = mongoose.model('Project')

/**
 * Index
 */

exports.index = function (req, res) {
  var contacts = req.flash('contact');
  var contact = ( contacts && contacts.length && contacts[contacts.length-1] ? contacts[contacts.length-1] : new Contact() );
  Q.ninvoke(Panel, 'find', {})
    .then(function (panels) { 
      res.locals['panels'] = res.locals.objectifyPanels(panels); 
      return Q.ninvoke(Project, 'find', {})
    })
    .then(function (projects) {
      res.locals['projects'] = projects;
      return res.render('home', { 
        title: 'Q Design & Communication Since 1981', 
        onload: 'changevid()',
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

