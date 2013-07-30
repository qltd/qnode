/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['project']
  , mongoose = require('mongoose')
  , Project = mongoose.model('Project')
  , utils = require('../../lib/utils');

/**
 * Index
 */

exports.index = function (req, res) {
  Project.find({}, function (err, projects) {
    if (err) return handleError(err);
    res.render('projects', { 
      projects: projects
    });
  });
}
