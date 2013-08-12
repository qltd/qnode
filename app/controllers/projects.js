
/**
 * Module dependencies
 */

var fs = require('fs')
  , mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , Q = require('q')
  , utils = require('../../lib/utils')
  , _ = require('underscore');

/**
 * Models
 */

var Project = mongoose.model('Project');

/**
 * Index
 * GET /projects
 */

exports.index = function (req, res) {
  Project.find({}, function (err, projects) {
    if (err) return handleError(err);
    res.render('projects', { 
      projects: projects
    });
  });
}

/**
 * Show
 *
 */

/**
 * New
 * GET /projects/new
 */

exports.new = function (req, res) {
  var projects = req.flash('project');
  var project = ( projects && projects.length && projects[projects.length-1] ? projects[projects.length-1] : new Project() );
  res.render('projects/new', {
    page_heading: 'Create Project',
    form_action: 'projects/new',
    submit_button_title: 'Create Project',
    project: project
  });
}

/**
 * Edit
 *
 */

/**
 * Create
 * POST /projects/new
 */

exports.create = function (req, res) {
  var project = new Project(req.body);

  project.images.forEach(function (image, key) {
    image = _.extend(image, req.files.images[key]);
    Q.fcall(fs.rename, image.tmpPath, image.sysPath)
      .then(function () {
        return true;
      })
      .fail(function (err) {
        console.log(err);
        return res.render('500');
      });
  });

  Q.ninvoke(project, 'save')
    .then(function () {
      req.flash('success', msg.project.created(project.title));
      return res.redirect('/projects');
    })
    .fail(function (err) {
      req.flash('error', utils.errors(err));
      req.flash('project', project);
      return res.redirect('/projects/new');
    });
}

/**
 * Update
 *
 */

/**
 * changeLog index
 * 
 */

/**
 * changeLog restore
 * 
 */
