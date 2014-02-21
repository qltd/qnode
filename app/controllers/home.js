
/**
 * Module dependencies
 */

var fs = require('fs')
  , mongoose = require('mongoose')
  , Promise = require('bluebird')
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
  var contacts = req.flash('contact');
  res.locals.contact = ( contacts && contacts.length && contacts[contacts.length-1] ? contacts[contacts.length-1] : new Contact() );

  Promise.all([
    Promise.promisify(Panel.find, Panel)({ parentView: 'home' }),
    Promise.promisify(Crew.find, Crew)(),
    Promise.promisify(Client.find, Client)(),
    Promise.promisify(Service.find, Service)(),
    Promise.promisify(Project.find, Project)(),
    Promise.promisify(Video.find, Video)({ mp4Src: { $ne: null }, oggSrc: { $ne: null }, published: { $ne: 0 }})
  ]).spread(function (panels, crew, clients, services, projects, videos) {
    var randomVideoKey = Math.floor((Math.random() * videos.length));
    return res.render('home', {
      panel: toCamelKeyObject(panels),
      crew: toAlphaSortedArray(crew, 'lastName'),
      clients: toAlphaSortedArray(clients),
      services: toSplitArray(services),
      projects: toAlphaSortedArray(projects),
      video: videos[randomVideoKey],
      logoLink: '#top',
      title: 'Q Design & Communication Since 1981'
    });
  }).catch(function (err) {
    return next(err); // 500
  });
};
