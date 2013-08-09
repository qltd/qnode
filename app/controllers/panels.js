/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['panel']
  , mongoose = require('mongoose')
  , Q = require('q')
  , utils = require('../../lib/utils')
  , _ = require('underscore');

/**
 * Model dependencies
 */

var Panel = mongoose.model('Panel');

/**
 * Show
 */

exports.show = function (req, res) {
  Q.ninvoke(Panel, 'findOne', { slug: req.params.slug })
    .then(function (panel) {
      if (!panel) return res.render('404');
      res.locals.panel = panel;
      return res.render('panels/show');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Edit
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
 * Update
 */

exports.update = function (req, res) {
  Q.ninvoke(Panel, 'findOne', { slug: req.params.slug })
    .then(function (panel) {
      if (!panel) return res.render('404');
      panel = _.extend(panel, req.body);
      return Q.ninvoke(panel, 'save');
    })
    .then(function () {
      req.flash('success', message.updated(req.body.title));
      return res.redirect('/panel');
    })
    .fail(function (err) {
      req.flash('error', utils.errors(err));
      return res.redirect('/panel/' + req.params.slug + '/edit');
    });
}

/**
 * Index
 */

exports.index = function (req, res) {
  Q.ninvoke(Panel.index, 'find')
    .then(function (panels) {
      res.locals.panels = panels;
      return res.render('panels');
    })
    .fail(function (err) {
      console.log(err);
      return res.render('500');
    });
}

/**
 * New panel
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
 * Create panel
 */

exports.create = function (req, res) {
  var panel = new Panel(req.body);
  panel.save(function (err) {
    if (err) {
      req.flash('error', utils.errors(err));
      req.flash('panel', panel);
      return res.redirect('/panel/new');
    } else {
      req.flash('success', message.created(panel.title));
      return res.redirect('/panel');
    }
  });
}

/**
 * Show change log
 */

exports.log = function (req, res) {
  Q.ninvoke(Panel, 'findOne', { slug: req.params.slug })
    .then(function (panel) {
      if (!panel) return res.render('404');
      res.locals.panel = panel;
      return res.render('panels/log');
    })
    .fail(function (err) {
      return res.render('500');
    });
}
