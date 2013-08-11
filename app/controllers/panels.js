
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
 */

exports.index = function (req, res) {
  Q.ninvoke(Panel.index, 'find')
    .then(function (panels) {
      res.locals.panels = panels;
      return res.render('panels');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Show
 * GET /panels/:slug
 * GET /panels/:slug/log/:__v
 */

exports.show = function (req, res) {
  Q.ninvoke(Panel, 'findOne', { slug: req.params.slug })
    .then(function (panel) {
      if (!panel) return res.render('404');
      res.locals.panel = ( req.params.__v && panel.changeLog[req.params.__v] ? _.extend(panel, panel.changeLog[req.params.__v].data) : panel );
      return res.render('panels/show');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * New
 * GET /panels/new
 */

exports.new = function (req, res) {
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
      return res.render('500');
    });
}

/**
 * Edit
 * GET /panels/:slug/edit
 */

exports.edit = function (req, res) {
  Q.ninvoke(Panel, 'findOne', { slug: req.params.slug })
    .then(function (panel) {
      if (!panel) return res.render('404');
      res.locals.panel = panel;
      return res.render('panels/edit');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Create
 * POST /panels/new
 */

exports.create = function (req, res) {
  var panel = new Panel(req.body);
  panel.save(function (err) {
    if (err) {
      req.flash('error', utils.errors(err));
      req.flash('panel', panel);
      return res.redirect('/panels/new');
    } else {
      req.flash('success', msg.panel.created(panel.title));
      return res.redirect('/panels');
    }
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
