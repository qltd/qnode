
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
  , Image = mongoose.model('Image').schema.methods;

/**
 * Index
 * GET /projects
 * GET /projects/json
 */

exports.index = function (req, res) {
  Q.ninvoke(Project.index, 'find')
    .then(function (projects) {
      res.locals.projects = projects;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(projects)); // json
      return res.render('projects'); // html
    })
    .fail(function (err) {
      console.log(err);
      return res.render('500');
    });
}

/**
 * Show
 * GET /projects/:slug
 * GET /projects/:slug/json
 * GET /projects/:slug/log/:__v
 * GET /projects/:slug/log/:__v/json
 */

exports.show = function (req, res) {
  Q.ninvoke(Project, 'findOne', { slug: req.params.slug })
    .then(function (project) {
      if (!project) return res.render('404');
      res.locals.project = ( req.params.__v && project.changeLog[req.params.__v] ? _.extend(project, project.changeLog[req.params.__v].data) : project );
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(res.locals.project)); // json
      return res.render('projects/show'); // html
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
  project.coverImage = Image.create(project.coverImage, req.files.coverImage);
  project.images = Image.create(project.images, req.files.images);
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

exports.update = function (req, res) {
  Image.update(Project, { slug: req.params.slug }, 'coverImage', req.body.coverImage, req.files.coverImage) 
    .then(function (data) {
      return Image.update(Project, { slug: req.params.slug }, 'images', req.body.images, req.files.images);
    })
    .then(function (data) {
      return Q.ninvoke(Project, 'findOne', { slug: req.params.slug });
    })
    .then(function (project) {
      if (!project) return res.render('404');
      project = _.extend(project, _.omit(req.body, 'images', 'coverImage'));
      return Q.ninvoke(project, 'save');
    })
    .then(function () {
      req.flash('success', msg.project.updated(req.body.title));
      return res.redirect('/projects');
    })
    .fail(function (err) {
      console.log(err);
      req.flash('error', utils.errors(err));
      return res.redirect('/projects/' + req.params.slug + '/edit');
    });
}

/**
 * changeLog index
 * GET /projects/:slug/log
 */

exports.log = function (req, res) {
  Q.ninvoke(Project.index, 'findOne', { slug: req.params.slug })
    .then(function (project) {
      if (!project) return res.render('404');
      res.locals.project = project;
      return res.render('projects/log');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * changeLog restore
 * GET /projects/:slug/log/:__v/restore
 */

exports.restore = function (req, res) {
  Q.ninvoke(Project.index, 'findOne', { slug: req.params.slug })
    .then(function (project) {
      if (!project || !project.changeLog[req.params.__v]) return res.render('404');
      _images = project.changeLog[req.params.__v].data.images;
      return Q.ninvoke(Project, 'update', { slug: req.params.slug }, { 'images' : _images });
    })
    .then(function () {
      return Q.ninvoke(Project.index, 'findOne', { slug: req.params.slug });
    })
    .then(function (project) {
      if (!project) return res.render('404');
      data = _.omit(project.changeLog[req.params.__v].data, '__v', 'images');
      data._meta = req.body._meta;
      project = _.extend(project, data);
      return Q.ninvoke(project, 'save');
    })
    .then(function () { 
      req.flash('success', msg.project.restored(data.title, req.params.__v));
      return res.redirect('/projects');
    })
    .fail(function (err) {
      console.log(err);
      return res.render('500');
    });
}
