
/**
 * Module dependencies
 */

var fs = require('fs')
  , mongoose = require('mongoose');

/**
 * Model dependencies
 */

var Project = mongoose.model('Project');

/**
 * Other dependencies
 */

var message = require('../../config/messages.js')['project']
  , utils = require('../../lib/utils');

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

  // Iterates through image array
  for (var i=0;i<project.image.length;i++) { 

    // Grabs temp path ./tmp/
    var tmp_path = req.files.image[i].path;

    // Sets the path to public directory
    var target_path = './public/images/uploads/' + req.files.image[i].name;
  
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
        });
    });
    // Adds image file name to project.image.name
    project.image[i].name = req.files.image[i].name;
  }

  project.save(function (err) {
    if (err) {
      req.flash('error', utils.errors(err));
      req.flash('project', project);
      return res.redirect('/projects/new');
    } else {
      req.flash('success', message.created(project.title));
      return res.redirect('/projects');
    }
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
