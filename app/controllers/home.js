
/**
 * Module dependencies
 */

var fs = require('fs')
  , mongoose = require('mongoose')
  , Q = require('q');

/**
 * Models
 */

var Contact = mongoose.model('Contact')
  , Panel = mongoose.model('Panel')
  , Project = mongoose.model('Project')
  , Service = mongoose.model('Service')
  , Client = mongoose.model('Client')
  , Crew = mongoose.model('Crew')
  , Video = mongoose.model('Video');

/**
 * Index
 * GET /
 */

exports.index = function (req, res, next) {
  Q.fcall(function () { 
    var contacts = req.flash('contact');
    return ( contacts && contacts.length && contacts[contacts.length-1] ? contacts[contacts.length-1] : new Contact() );
  })
    .then(function (contact) {
      res.locals.contact = contact;
      return Q.ninvoke(Panel.home, 'find');
    })
    .then(function (panels) { 
      /** make panels accessible as panel.slug; where slug has had hyphens removed, and been converted to camelCase */
      res.locals.panel = toCamelKeyObject(panels);
      return Q.ninvoke(Crew.index, 'find');
    })
    .then(function (crew) { 
      res.locals.crew = crew;
      return Q.ninvoke(Client.index, 'find');
    })
    .then(function (clients) { 
      res.locals.clients = clients;
      return Q.ninvoke(Service.positioned, 'find');
    })
    .then(function (services) {
      /** make an array of the services array that has half of its children in either of two keys */
      res.locals.services = toSplitArray(services);
      return Q.ninvoke(Project.index, 'find');
    })
    .then(function (projects) {
      /** perform a proper alpha-ordering that accounts for 'the' and is not case sensitive */
      res.locals.projects = toAlphaSortedArray(projects);
      return Q.ninvoke(Video.notNull, 'find');
    })
    .then(function (videos) {
      if (videos.length > 0) {
        var randomVideoKey = Math.floor((Math.random() * videos.length));
        res.locals.video = videos[randomVideoKey];
      }
      return res.render('home', { 
        logoLink: '#top',
        title: 'Q Design & Communication Since 1981'
      }); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
};
