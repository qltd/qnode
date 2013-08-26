
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , Q = require('q')
  , _ = require('underscore');

/**
 * Models
 */

var Service = mongoose.model('Service'); 

/**
 * Index
 * GET /services
 * GET /services/json
 */

exports.index = function (req, res, next) {
  Q.ninvoke(Service.index, 'find')
    .then(function (services) {
      res.locals.services = services;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(services)); // json
      return res.render('services'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Show
 * GET /services/:slug
 * GET /services/:slug/json
 * GET /services/:slug/log/:__v
 * GET /services/:slug/log/:__v/json
 */

exports.show = function (req, res, next) {
  Q.ninvoke(Service, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return next(); // 404
      res.locals.service = ( req.params.__v && service.changeLog[req.params.__v] ? _.extend(service, service.changeLog[req.params.__v].data) : service );
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(res.locals.service)); // json
      return res.render('services/show'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * New
 * GET /services/new
 */

exports.new = function (req, res, next) {
  Q.fcall(function () {
    var services = req.flash('service');
    return ( services && services.length && services[services.length-1] ? services[services.length-1] : new Service() );
  })
    .then(function (service) {
      res.locals.service = service;
      return res.render('services/new', { 
        pageHeading: 'Create Service'
      }); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Edit
 * GET /services/:slug/edit
 */

exports.edit = function (req, res, next) {
  Q.ninvoke(Service, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return next(); // 404
      res.locals.service = service;
      return res.render('services/edit'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Create
 * POST /services/new
 */

exports.create = function (req, res, next) {
  var service = new Service(req.body);
  Q.ninvoke(service, 'save')
    .then(function () {
      req.flash('success', msg.service.created(service.title));
      return res.redirect('/services'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500
      req.flash('error', vErr);
      req.flash('service', service);
      return res.redirect('/services/new'); // html
    });
}

/**
 * Update
 * POST /services/:slug/edit
 */

exports.update = function (req, res, next) {
  Q.ninvoke(Service, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return next(); // 404
      service = _.extend(service, req.body);
      return Q.ninvoke(service, 'save');
    })
    .then(function () {
      req.flash('success', msg.service.updated(req.body.title));
      return res.redirect('/services'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500 
      req.flash('error', vErr);
      return res.redirect('/services/' + req.params.slug + '/edit'); // html
    });
}

/**
 * changeLog index
 * GET /services/:slug/log
 */

exports.log = function (req, res, next) {
  Q.ninvoke(Service.index, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return next(); // 404
      res.locals.service = service;
      return res.render('services/log'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * changeLog restore
 * GET /services/:slug/log/:__v/restore
 */

exports.restore = function (req, res, next) {
  Q.ninvoke(Service.index, 'findOne', { slug: req.params.slug })
    .then(function (service) {
      if (!service) return next(); // 404
      data = _.omit(service.changeLog[req.params.__v].data, '__v');
      data._meta = req.body._meta;
      service = _.extend(service, data);
      return Q.ninvoke(service, 'save');
    })
    .then(function () {
      req.flash('success', msg.service.restored(data.title, req.params.__v));
      return res.redirect('/services'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
} 
