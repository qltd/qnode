/**
 * Module dependencies
 */

var message = require('../../config/messages.js')
  , mongoose = require('mongoose')
  , Q = require('q')
  , utils = require('../../lib/utils')
  , _ = require('underscore');

/**
 * Model dependencies
 */

var Service = mongoose.model('Service'); 

/**
 * Show
 */

exports.show = function (req, res) {
  Q.ninvoke(Service, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return res.render('404');
      res.locals.service = service;
      return res.render('services/show');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Edit
 */

exports.edit = function (req, res) {
  Q.ninvoke(Service, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return res.render('404');
      res.locals.service = service;
      return res.render('services/edit');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Update
 */

exports.update = function (req, res) {
  Q.ninvoke(Service, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return res.render('404');
      service = _.extend(service, req.body);
      return Q.ninvoke(service, 'save');
    })
    .then(function () {
      req.flash('success', message.updated(req.body.title));
      return res.redirect('/service');
    })
    .fail(function (err) {
      req.flash('error', utils.errors(err));
      return res.redirect('/service/' + req.params.slug + '/service');
    });
}

/**
 * Index
 */

exports.index = function (req, res) {
  Q.ninvoke(Service.index, 'find')
    .then(function (services) {
      res.locals.services = services;
      return res.render('services');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * New
 */

exports.new = function (req, res) {
  Q.fcall(function () {
    var services = req.flash('service');
    return ( services && services.length && services[services.length-1] ? services[services.length-1] : new Service() );
  })
    .then(function (service) {
      res.locals.service = service;
      return res.render('services/new', { 
        pageHeading: 'Create Service'
      });
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Create
 */

exports.create = function (req, res) {
  var service = new Service(req.body);
  service.save(function (err) {
    if (err) {
      req.flash('error', utils.errors(err));
      req.flash('service', service);
      return res.redirect('/service/new');
    } else {
      req.flash('success', message.created(service.title));
      return res.redirect('/service');
    }
  });
}

/**
 * Show change log
 */

exports.log = function (req, res) {
  Q.ninvoke(Service, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return res.render('404');
      res.locals.service = service;
      return res.render('services/log');
    })
    .fail(function (err) {
      return res.render('500');
    });
}
