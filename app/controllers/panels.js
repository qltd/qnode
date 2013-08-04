/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['panel']
  , mongoose = require('mongoose')
  , Q = require('q')
  , utils = require('../../lib/utils');

/**
 * Model dependencies
 */

var Panel = mongoose.model('Panel');

/**
 * Index
 */

exports.index = function (req, res) {
  Q.ninvoke(Panel, 'find')
    .then(function (panels) {
      res.locals.panels = panels;
      return res.render('panels');
    })
    .fail(function (err) {
      return handleError(err);
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
        page_heading: 'Create Panel', 
        form_action: '/panels/new', 
        submit_button_title: 'Create'
      });
    })
    .fail(function (err) {
      return handleError(err);
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
