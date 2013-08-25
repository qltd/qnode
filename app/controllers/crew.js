
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

var Crew = mongoose.model('Crew')
  , Image = mongoose.model('Image').schema.methods;


/**
 * Index
 * GET /crew
 * GET /crew/json
 */

exports.index = function (req, res) {
  Q.ninvoke(Crew.index, 'find')
    .then(function (crew) {
      res.locals.crew = crew;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(crew)); // json
      return res.render('crew'); // html
    })
    .fail(function (err) {
      console.log(err);
      return res.render('500');
    });
}

/**
 * Show
 * GET /crew/:slug
 * GET /crew/:slug/json
 * GET /crew/:slug/log/:__v
 * GET /crew/:slug/log/:__v/json
 */

exports.show = function (req, res) {
  Q.ninvoke(Crew, 'findOne', { slug: req.params.slug })
    .then(function (crew) {
      if (!crew) return res.render('404');
      res.locals.crew = ( req.params.__v && crew.changeLog[req.params.__v] ? _.extend(crew, crew.changeLog[req.params.__v].data) : crew );
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(res.locals.crew)); // json
      return res.render('crew/show'); // html
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * New
 * GET /crew/new
 */

exports.new = function (req, res) {
  Q.fcall(function () {
    var crew = req.flash('crew');
    return ( crew && crew.length && crew[crew.length-1] ? crew[crew.length-1] : new Crew() );
  })
    .then(function (crew) {
      res.locals.crew = crew;
      return res.render('crew/new', { 
        pageHeading: 'Create Crew'
      });
    })
    .fail(function (err) {
      console.log(err);
      return res.render('500');
    });
}

/**
 * Edit
 * GET /crew/:slug/edit
 */

exports.edit = function (req, res) {
  Q.ninvoke(Crew, 'findOne', { slug: req.params.slug })
    .then(function (crew) {
      if (!crew) return res.render('404');
      res.locals.crew = crew;
      return res.render('crew/edit');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Create
 * POST /crew/new
 */

exports.create = function (req, res) {
  var crew = new Crew(req.body);
  crew.image = Image.create(crew.image, req.files.image);
  Q.ninvoke(crew, 'save')
    .then(function () {
      req.flash('success', msg.crew.created(crew.title));
      return res.redirect('/crew');
    })
    .fail(function (err) {
      req.flash('error', utils.errors(err));
      req.flash('crew', crew);
      return res.redirect('/crew/new');
    });
}

/**
 * Update
 * POST /crew/:slug/edit
 */

exports.update = function (req, res) {
  Image.update(Crew, { slug: req.params.slug }, 'image', req.body.image, req.files.image)
    .then(function (data) {
      return Q.ninvoke(Crew, 'findOne', { slug: req.params.slug })
    })
    .then(function (crew) {
      if (!crew) return res.render('404');
      crew = _.extend(crew, _.omit(req.body, 'image'));
      return Q.ninvoke(crew, 'save');
    })
    .then(function () {
      req.flash('success', msg.crew.updated(req.body.firstName + ' ' + ( req.body.middleName ? req.body.middleName + ' ' : '' ) + req.body.lastName));
      return res.redirect('/crew');
    })
    .fail(function (err) {
      console.log(err);
      req.flash('error', utils.errors(err));
      return res.redirect('/crew/' + req.params.slug + '/edit');
    });
}

/**
 * changeLog index
 * GET /crew/:slug/log
 */

exports.log = function (req, res) {
  Q.ninvoke(Crew.index, 'findOne', { slug: req.params.slug })
    .then(function (crew) {
      if (!crew) return res.render('404');
      res.locals.crew = crew;
      return res.render('crew/log');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * changeLog restore
 * GET /crew/:slug/log/:__v/restore
 */
 
exports.restore = function (req, res) {
  Q.ninvoke(Crew.index, 'findOne', { slug: req.params.slug })
    .then(function (crew) {
      if (!crew) return res.render('404');
      img = crew.changeLog[req.params.__v].data.image;
      return Q.ninvoke(Crew, 'update', { slug: req.params.slug }, { 'image' : img });
    })
    .then(function () {
      return Q.ninvoke(Crew.index, 'findOne', { slug: req.params.slug });
    })
    .then(function (crew) {
      if (!crew) return res.render('404');
      data = _.omit(crew.changeLog[req.params.__v].data, '__v', 'image');
      data._meta = req.body._meta;
      crew = _.extend(crew, data);
      return Q.ninvoke(crew, 'save');
    })
    .then(function () { 
      req.flash('success', msg.crew.restored(data.title, req.params.__v));
      return res.redirect('/crew');
    })
    .fail(function (err) {
      console.log(err);
      return res.render('500');
    });
}
