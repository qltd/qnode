
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

var Project = mongoose.model('Project')
  , Image = mongoose.model('Image');

/**
 * Index
 * GET /projects
 */

exports.index = function (req, res) {
  Q.ninvoke(Project.index, 'find')
    .then(function (projects) {
      res.locals.projects = projects;
      return res.render('projects');
    })
    .fail(function (err) {
      console.log(err);
      return res.render('500');
    });
}

/**
 * Show
 * GET /projects/:slug
 * GET /projects/:slug/log/:__v
 */

exports.show = function (req, res) {
  Q.ninvoke(Project, 'findOne', { slug: req.params.slug })
    .then(function (project) {
      if (!project) return res.render('404');
      res.locals.project = ( req.params.__v && project.changeLog[req.params.__v] ? _.extend(project, project.changeLog[req.params.__v].data) : project );
      return res.render('projects/show');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * New
 * GET /projects/new
 */

exports.new = function (req, res) {
  Q.fcall(function () {
    var projects = req.flash('project');
    return ( projects && projects.length && projects[projects.length-1] ? projects[projects.length-1] : new Project() );
  })
    .then(function (project) {
      res.locals.project = project;
      return res.render('projects/new', { 
        pageHeading: 'Create Project'
      });
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Edit
 * GET /projects/:slug/edit
 */

exports.edit = function (req, res) {
  Q.ninvoke(Project, 'findOne', { slug: req.params.slug })
    .then(function (project) {
      if (!project) return res.render('404');
      res.locals.project = project;
      return res.render('projects/edit');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

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
 * POST /projects/:slug/edit
 */



/**
 * changeLog index
 * 
 */

/**
 * changeLog restore
 * 
 */
