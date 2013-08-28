
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , Q = require('q')
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

exports.index = function (req, res, next) {
  Q.ninvoke(Project.index, 'find')
    .then(function (projects) {
      res.locals.projects = projects;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(projects)); // json
      return res.render('projects'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Show
 * GET /projects/:slug
 * GET /projects/:slug/json
 * GET /projects/:slug/log/:__v
 * GET /projects/:slug/log/:__v/json
 */

exports.show = function (req, res, next) {
  Q.ninvoke(Project, 'findOne', { slug: req.params.slug })
    .then(function (project) {
      if (!project) return next(); // 404
      res.locals.project = ( req.params.__v && project.changeLog[req.params.__v] ? _.extend(project, project.changeLog[req.params.__v].data) : project );
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(res.locals.project)); // json
      return res.render('projects/show'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * New
 * GET /projects/new
 */

exports.new = function (req, res, next) {
  Q.fcall(function () {
    var projects = req.flash('project');
    return ( projects && projects.length && projects[projects.length-1] ? projects[projects.length-1] : new Project() );
  })
    .then(function (project) {
      res.locals.project = project;
      return res.render('projects/new', { 
        pageHeading: 'Create Project'
      }); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Edit
 * GET /projects/:slug/edit
 */

exports.edit = function (req, res, next) {
  Q.ninvoke(Project, 'findOne', { slug: req.params.slug })
    .then(function (project) {
      if (!project) return next(); // 404
      res.locals.project = project;
      return res.render('projects/edit'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Create
 * POST /projects/new
 */

exports.create = function (req, res, next) {
  var project = new Project(req.body);
  project.coverImage = Image.create(project.coverImage, req.files.coverImage);
  project.images = Image.create(project.images, req.files.images);
  
  var _coverImage = [];
  project.coverImage.forEach(function (img) {
    _coverImage.push(Image.addImageInfo(img.sysPathRetina));
  });
  var _images = [];
  project.images.forEach(function (img) {
    _images.push(Image.addImageInfo(img.sysPathRetina));
  });

  Q.all(_coverImage)
    .then(function (infoset) {
      infoset.forEach(function (info, key) {
        project.coverImage[key].info = _.omit(info, 'Png:IHDR.color-type-orig', 'Png:IHDR.bit-depth-orig');
      });
      return Q.all(_images);
    })
    .then(function (infoset) {
      infoset.forEach(function (info, key) {
        project.images[key].info = _.omit(info, 'Png:IHDR.color-type-orig', 'Png:IHDR.bit-depth-orig');
      });
      return Q.ninvoke(project, 'save');
    })
    .then(function () {
      req.flash('success', msg.project.created(project.title));
      return res.redirect('/projects'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500
      req.flash('error', vErr);
      req.flash('project', project);
      return res.redirect('/projects/new'); // html
    });
}

/**
 * Update
 * POST /projects/:slug/edit
 */

exports.update = function (req, res, next) {
  Q.fcall(Image.update, Project, { slug: req.params.slug }, 'coverImage', req.body.coverImage, req.files.coverImage) 
    .then(function (update) {
      return update; // update coverImage
    })
    .then(function (updateData) {
      return Q.fcall(Image.update, Project, { slug: req.params.slug }, 'images', req.body.images, req.files.images);
    })
    .then(function (update) {
      return update; // update images
    })
    .then(function (updateData) {
      return Q.ninvoke(Project, 'findOne', { slug: req.params.slug });
    })
    .then(function (project) {
      if (!project) return next(); // 404
      project = _.extend(project, _.omit(req.body, 'images', 'coverImage'));
      return Q.ninvoke(project, 'save');
    })
    .then(function () {
      req.flash('success', msg.project.updated(req.body.title));
      return res.redirect('/projects'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500 
      req.flash('error', vErr);
      return res.redirect('/projects/' + req.params.slug + '/edit'); // html
    });
}

/**
 * changeLog index
 * GET /projects/:slug/log
 */

exports.log = function (req, res, next) {
  Q.ninvoke(Project.index, 'findOne', { slug: req.params.slug })
    .then(function (project) {
      if (!project) return next(); // 404
      res.locals.project = project;
      return res.render('projects/log'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * changeLog restore
 * GET /projects/:slug/log/:__v/restore
 */

exports.restore = function (req, res, next) {
  Q.ninvoke(Project.index, 'findOne', { slug: req.params.slug })
    .then(function (project) {
      if (!project || !project.changeLog[req.params.__v]) return next(); // 404
      res.locals.project = project;
      var images = project.changeLog[req.params.__v].data.images;
      return Image.restore(Project, { slug: req.params.slug }, 'images', images);
    })
    .then(function () {
      var coverImage = res.locals.project.changeLog[req.params.__v].data.coverImage;
      return Image.restore(Project, { slug: req.params.slug }, 'coverImage', coverImage);
    })
    .then(function () {
      return Q.ninvoke(Project.index, 'findOne', { slug: req.params.slug });
    })
    .then(function (project) {
      if (!project) return next(); // 404
      var data = _.omit(project.changeLog[req.params.__v].data, '__v', 'images');
      data._meta = req.body._meta;
      project = _.extend(project, data);
      res.locals.project = project;
      return Q.ninvoke(project, 'save');
    })
    .then(function () { 
      req.flash('success', msg.project.restored(res.locals.project.title, req.params.__v));
      return res.redirect('/projects'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}
