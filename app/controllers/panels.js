
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

var Panel = mongoose.model('Panel');

/**
 * Index
 * GET /panels
 * GET /panels/json
 */

exports.index = function (req, res, next) {
  Q.ninvoke(Panel.index, 'find')
    .then(function (panels) {
      res.locals.panels = panels;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(panels)); // json
      return res.render('panels'); // html
    })
    .fail(function (err) {
      return next(err);
    });
}

/**
 * Show
 * GET /panels/:slug
 * GET /panels/:slug/json
 * GET /panels/:slug/log/:__v
 * GET /panels/:slug/log/:__v/json
 */

exports.show = function (req, res, next) {
  Q.ninvoke(Panel, 'findOne', { slug: req.params.slug })
    .then(function (panel) {
      if (!panel) return next(); // 404
      res.locals.panel = ( req.params.__v && panel.changeLog[req.params.__v] ? _.extend(panel, panel.changeLog[req.params.__v].data) : panel );
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(res.locals.panel)); // json
      return res.render('panels/show'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * New
 * GET /panels/new
 */

exports.new = function (req, res, next) {
  Q.fcall(function () {
    var panels = req.flash('panel');
    return ( panels && panels.length && panels[panels.length-1] ? panels[panels.length-1] : new Panel() );
  })
    .then(function (panel) {
      res.locals.panel = panel;
      return res.render('panels/new', { 
        pageHeading: 'Create Panel'
      });
    })
    .fail(function (err) {
      return next(err);
    });
}

/**
 * Edit
 * GET /panels/:slug/edit
 */

exports.edit = function (req, res, next) {
  Q.ninvoke(Panel, 'findOne', { slug: req.params.slug })
    .then(function (panel) {
      if (!panel) return next();
      res.locals.panel = panel;
      return res.render('panels/edit');
    })
    .fail(function (err) {
      return next(err);
    });
}

/**
 * Create
 * POST /panels/new
 */

exports.create = function (req, res, next) {
  var panel = new Panel(req.body);
  Q.ninvoke(panel, 'save')
    .then(function () {
      req.flash('success', msg.panel.created(panel.title));
      return res.redirect('/panels');
    })
    .fail(function (err) {
      req.flash('error', utils.errors(err));
      req.flash('panel', panel);
      return res.redirect('/panels/new');
    });
}

/**
 * Update
 * POST /panels/:slug/edit
 */

exports.update = function (req, res) {
  Q.ninvoke(Panel, 'findOne', { slug: req.params.slug })
    .then(function (panel) {
      if (!panel) return res.render('404');
      panel = _.extend(panel, req.body);
      return Q.ninvoke(panel, 'save');
    })
    .then(function () {
      req.flash('success', msg.panel.updated(req.body.title));
      return res.redirect('/panels');
    })
    .fail(function (err) {
      req.flash('error', utils.errors(err));
      return res.redirect('/panels/' + req.params.slug + '/edit');
    });
}

/**
 * changeLog index
 * GET /panels/:slug/log
 */

exports.log = function (req, res) {
  Q.ninvoke(Panel.index, 'findOne', { slug: req.params.slug })
    .then(function (panel) {
      if (!panel) return res.render('404');
      res.locals.panel = panel;
      return res.render('panels/log');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * changeLog restore
 * GET /panels/:slug/log/:__v/restore
 */

exports.restore = function (req, res) {
  Q.ninvoke(Panel.index, 'findOne', { slug: req.params.slug })
    .then(function (panel) {
      if (!panel) return res.render('404');
      data = _.omit(panel.changeLog[req.params.__v].data, '__v');
      data._meta = req.body._meta;
      panel = _.extend(panel, data);
      return Q.ninvoke(panel, 'save');
    })
    .then(function () {
      req.flash('success', msg.panel.restored(data.title, req.params.__v));
      return res.redirect('/panels');
    })
    .fail(function (err) {
      return res.render('500');
    });
}
