
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
    if (req.files.images[key] && req.files.images[key].name) {
      image = _.extend(image, req.files.images[key]);
      Q.fcall(fs.rename, image.tmpPath, image.sysPath)
        .then(function () {
          return true;
        })
        .fail(function (err) {
          return res.render('500');
        });
    } else {
      image.remove();
    }
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

exports.update = function (req, res) {

  // construct fresh array of associated images
  var _images = [];
  req.body.images.forEach(function (image, key) {
    if (req.files.images[key].name && image.name) {
      // new image with old data
      _images.push(new Image(_.extend(req.files.images[key], _.omit(image, 'name', 'type', 'size'))));
    } else if (req.files.images[key].name && !image.name) {
      // new image with new data
      _images.push(new Image(_.extend(req.files.images[key], image)));
    } else if (image.name) {
      // old image with potentially new data
      _images.push(new Image(image));
    }
  });

  // handle file data
  req.files.images.forEach(function (image, key) {
    if (image.name) {
      Q.fcall(fs.rename, _images[key].tmpPath, _images[key].sysPath)
        .then(function () {
          return true;
        })
        .fail(function (err) {
          console.log(err);
          return res.render('500');
        });
    } else if (image.path) {
      Q.fcall(fs.unlink, req.files.images[key].path)
        .then(function () {
          return true;
        })
        .fail(function (err) {
          console.log(err);
          return res.render('500');
        });
    }
  });

  // update images before other parent doc data
  Q.ninvoke(Project, 'update', { slug: req.params.slug }, { 'images' : _images })
    .then(function (data) {
      return Q.ninvoke(Project, 'findOne', { slug: req.params.slug })
    })
    .then(function (project) {
      if (!project) return res.render('404');
      project = _.extend(project, _.omit(req.body, 'images'));
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
      if (!project) return res.render('404');
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
