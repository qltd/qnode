/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['panel']
  , mongoose = require('mongoose')
  , Panel = mongoose.model('Panel')
  , utils = require('../../lib/utils');

/**
 * Index
 */

exports.index = function (req, res) {
  Panel.find({}, function (err, panels) {
    if (err) return handleError(err);
    res.render('panels', { 
      information: req.flash('info'),
      successes: req.flash('success'),
      warnings: req.flash('warning'),
      errors: req.flash('error'),
      panels: panels
    });
  });
}

/**
* New user
*/

exports.new = function (req, res) {
  var panels = req.flash('panel');
  var panel = ( panels && panels.length && panels[panels.length-1] ? panels[panels.length-1] : new Panel() );
  res.render('panels/new', { 
    page_heading: 'Create Panel', 
    form_action: '/panels/new', 
    submit_button_title: 'Create',
    errors: req.flash('error'),
    panel: panel
  });
}

/**
 * Create contact
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
