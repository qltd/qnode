
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , Q = require('q')
  , utils = require('../../lib/utils')
  , _ = require('underscore');

/**
 * Models
 */

var Service = mongoose.model('Service'); 

/**
 * Index
 * GET /services
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
 * Show
 * GET /services/:slug
 * GET /services/:slug/log/:__v
 */

exports.show = function (req, res) {
  Q.ninvoke(Service, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return res.render('404');
      res.locals.service = ( req.params.__v && service.changeLog[req.params.__v] ? _.extend(service, service.changeLog[req.params.__v].data) : service );
      return res.render('services/show');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * New
 * GET /services/new
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
 * Edit
 * GET /services/:slug/edit
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
 * Create
 * POST /services/new
 */

exports.create = function (req, res) {
  var service = new Service(req.body);
  service.save(function (err) {
    if (err) {
      req.flash('error', utils.errors(err));
      req.flash('service', service);
      return res.redirect('/services/new');
    } else {
      req.flash('success', msg.service.created(service.title));
      return res.redirect('/services');
    }
  });
}

/**
 * Update
 * POST /services/:slug/edit
 */

exports.update = function (req, res) {
  Q.ninvoke(Service, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return res.render('404');
      service = _.extend(service, req.body);
      return Q.ninvoke(service, 'save');
    })
    .then(function () {
      req.flash('success', msg.service.updated(req.body.title));
      return res.redirect('/services');
    })
    .fail(function (err) {
      req.flash('error', utils.errors(err));
      return res.redirect('/services/' + req.params.slug + '/edit');
    });
}

/**
 * changeLog index
 * GET /services/:slug/log
 */

exports.log = function (req, res) {
  Q.ninvoke(Service.index, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return res.render('404');
      res.locals.service = service;
      return res.render('services/log');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * changeLog restore
 * GET /services/:slug/log/:__v/restore
 */

exports.restore = function (req, res) {
  Q.ninvoke(Service.index, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return res.render('404');
      data = _.omit(service.changeLog[req.params.__v].data, '__v');
      data._meta = req.body._meta;
      service = _.extend(service, data);
      return Q.ninvoke(service, 'save');
    })
    .then(function () {
      req.flash('success', msg.service.restored(data.title, req.params.__v));
      return res.redirect('/services');
    })
    .fail(function (err) {
      return res.render('500');
    });
} 
