
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

var Video = mongoose.model('Video');

/**
 * Index
 * GET /videos
 * GET /videos/json
 */

exports.index = function (req, res, next) {
  Q.ninvoke(Video.index, 'find')
    .then(function (videos) {
      res.locals.videos = videos;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(videos)); // json
      return res.render('videos'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Show
 * GET /videos/:slug
 * GET /videos/:slug/json
 * GET /videos/:slug/log/:__v
 * GET /videos/:slug/log/:__v/json
 */

exports.show = function (req, res, next) {
  Q.ninvoke(Video, 'findOne', { slug: req.params.slug })
    .then(function (video) {
      if (!video) return next(); // 404
      res.locals.video = ( req.params.__v && video.changeLog[req.params.__v] ? _.extend(video, video.changeLog[req.params.__v].data) : video );
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(res.locals.video)); // json
      return res.render('videos/show'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * New
 * GET /videos/new
 */

exports.new = function (req, res, next) {
  Q.fcall(function () {
    var videos = req.flash('video');
    return ( videos && videos.length && videos[videos.length-1] ? videos[videos.length-1] : new Video() );
  })
    .then(function (video) {
      res.locals.video = video;
      return res.render('videos/new', { 
        pageHeading: 'Create Video'
      }); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Edit
 * GET /videos/:slug/edit
 */

exports.edit = function (req, res, next) {
  Q.ninvoke(Video, 'findOne', { slug: req.params.slug })
    .then(function (video) {
      if (!video) return next(); // 404
      res.locals.video = video;
      return res.render('videos/edit'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Create
 * POST /videos/new
 */

exports.create = function (req, res, next) {
  var video = new Video(_.extend(req.body, req.files));
  Q.ninvoke(video, 'save')
    .then(function () {
      req.flash('success', msg.video.created(video.title));
      return res.redirect('/videos'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500
      req.flash('error', vErr);
      req.flash('video', video);
      return res.redirect('/videos/new'); // html
    });
}

/**
 * Update
 * POST /videos/:slug/edit
 */

exports.update = function (req, res, next) {
  Q.ninvoke(Video, 'findOne', { slug: req.params.slug })
    .then(function (video) {
      if (!video) return next(); // 404
      var video = _.extend(video, _.extend(req.body, req.files));
      return Q.ninvoke(video, 'save');
    })
    .then(function () {
      req.flash('success', msg.video.updated(req.body.title));
      return res.redirect('/videos'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500 
      req.flash('error', vErr);
      return res.redirect('/videos/' + req.params.slug + '/edit'); // html
    });
}

/**
 * changeLog index
 * GET /videos/:slug/log
 */

exports.log = function (req, res, next) {
  Q.ninvoke(Video.index, 'findOne', { slug: req.params.slug })
    .then(function (video) {
      if (!video) return next(); // 404
      res.locals.video = video;
      return res.render('videos/log'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * changeLog restore
 * GET /videos/:slug/log/:__v/restore
 */

exports.restore = function (req, res, next) {
  Q.ninvoke(Video.index, 'findOne', { slug: req.params.slug })
    .then(function (video) {
      if (!video) return next(); // 404
      data = _.omit(video.changeLog[req.params.__v].data, '__v');
      data._meta = req.body._meta;
      video = _.extend(video, data);
      return Q.ninvoke(video, 'save');
    })
    .then(function () {
      req.flash('success', msg.video.restored(data.title, req.params.__v));
      return res.redirect('/videos'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
} 
