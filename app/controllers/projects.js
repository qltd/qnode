/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['project']
  , mongoose = require('mongoose')
  , Project = mongoose.model('Project')
  , utils = require('../../lib/utils')
  , fs = require('fs');

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

/**
 * New Project
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
 * Create Project
 */

exports.create = function (req, res) {
  var project = new Project(req.body);
  console.log(req.files.image);
  project.save(function (err) {
    console.log(project);
    if (err) {
      req.flash('error', utils.errors(err));
      req.flash('project', project);
      return res.redirect('/project/new');
    } else {
      req.flash('success', message.created(project.title));
      return res.redirect('/project');
    }
  });
}