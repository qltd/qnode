
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

var Job = mongoose.model('Job');

/**
 * Index
 * GET /jobs
 * GET /jobs/json
 */

exports.index = function (req, res, next) {
  Q.ninvoke(Job.index, 'find')
    .then(function (jobs) {
      res.locals.jobs = jobs;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(jobs)); // json
      return res.render('jobs'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Show
 * GET /jobs/:slug
 * GET /jobs/:slug/json
 * GET /jobs/:slug/log/:__v
 * GET /jobs/:slug/log/:__v/json
 */

exports.show = function (req, res, next) {
  Q.ninvoke(Job, 'findOne', { slug: req.params.slug })
    .then(function (job) {
      if (!job) return next(); // 404
      res.locals.job = ( req.params.__v && job.changeLog[req.params.__v] ? _.extend(job, job.changeLog[req.params.__v].data) : job );
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(res.locals.job)); // json
      return res.render('jobs/show'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * New
 * GET /jobs/new
 */

exports.new = function (req, res, next) {
  Q.fcall(function () {
    var jobs = req.flash('job');
    return ( jobs && jobs.length && jobs[jobs.length-1] ? jobs[jobs.length-1] : new Job() );
  })
    .then(function (job) {
      res.locals.job = job;
      return res.render('jobs/new', { 
        pageHeading: 'Create Job Listing'
      }); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Edit
 * GET /jobs/:slug/edit
 */

exports.edit = function (req, res, next) {
  Q.ninvoke(Job, 'findOne', { slug: req.params.slug })
    .then(function (job) {
      if (!job) return next(); // 404
      res.locals.job = job;
      return res.render('jobs/edit'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Create
 * POST /jobs/new
 */

exports.create = function (req, res, next) {
  var job = new Job(req.body);
  Q.ninvoke(job, 'save')
    .then(function () {
      req.flash('success', msg.job.created(job.title));
      return res.redirect('/jobs'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500
      req.flash('error', vErr);
      req.flash('job', job);
      return res.redirect('/jobs/new'); // html
    });
}

/**
 * Update
 * POST /jobs/:slug/edit
 */

exports.update = function (req, res, next) {
  Q.ninvoke(Job, 'findOne', { slug: req.params.slug })
    .then(function (job) {
      if (!job) return next(); // 404
      job = _.extend(job, req.body);
      return Q.ninvoke(job, 'save');
    })
    .then(function () {
      req.flash('success', msg.job.updated(req.body.title));
      return res.redirect('/jobs'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500 
      req.flash('error', vErr);
      return res.redirect('/jobs/' + req.params.slug + '/edit'); // html
    });
}

/**
 * changeLog index
 * GET /jobs/:slug/log
 */

exports.log = function (req, res, next) {
  Q.ninvoke(Job.index, 'findOne', { slug: req.params.slug })
    .then(function (job) {
      if (!job) return next(); // 404
      res.locals.job = job;
      return res.render('jobs/log'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * changeLog restore
 * GET /jobs/:slug/log/:__v/restore
 */

exports.restore = function (req, res, next) {
  Q.ninvoke(Job.index, 'findOne', { slug: req.params.slug })
    .then(function (job) {
      if (!job) return next(); // 404
      data = _.omit(job.changeLog[req.params.__v].data, '__v');
      data._meta = req.body._meta;
      job = _.extend(job, data);
      return Q.ninvoke(job, 'save');
    })
    .then(function () {
      req.flash('success', msg.job.restored(data.title, req.params.__v));
      return res.redirect('/jobs'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}
