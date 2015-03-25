
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

var Crew = mongoose.model('Crew')
  , Image = mongoose.model('Image').schema.methods;

/**
 * Index
 * GET /crew
 * GET /crew/json
 */

exports.index = function (req, res, next) {
  Q.ninvoke(Crew.index, 'find')
    .then(function (crew) {
      res.locals.crew = crew;
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(crew)); // json
      return res.render('crew'); // html
    })
    .fail(function (err) {
      console.log(err);
      return next(err); // 500
    });
}

/**
 * Show
 * GET /crew/:slug
 * GET /crew/:slug/json
 * GET /crew/:slug/log/:__v
 * GET /crew/:slug/log/:__v/json
 */

exports.show = function (req, res, next) {
  Q.ninvoke(Crew, 'findOne', { slug: req.params.slug })
    .then(function (crew) {
      if (!crew) return next(); // 404
      res.locals.crew = ( req.params.__v && crew.changeLog[req.params.__v] ? _.extend(crew, crew.changeLog[req.params.__v].data) : crew );
      if (req.url.indexOf('/json') > -1) return res.send(stripMongoIds(res.locals.crew)); // json
      return res.render('crew/show'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * New
 * GET /crew/new
 */

exports.new = function (req, res, next) {
  Q.fcall(function () {
    var crew = req.flash('crew');
    return ( crew && crew.length && crew[crew.length-1] ? crew[crew.length-1] : new Crew() );
  })
    .then(function (crew) {
      res.locals.crew = crew;
      return res.render('crew/new', { 
        pageHeading: 'Create Crew'
      }); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Edit
 * GET /crew/:slug/edit
 */

exports.edit = function (req, res, next) {
  Q.ninvoke(Crew, 'findOne', { slug: req.params.slug })
    .then(function (crew) {
      if (!crew) return next(); // 404
      res.locals.crew = crew;
      return res.render('crew/edit'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * Create
 * POST /crew/new
 */

exports.create = function (req, res, next) {
  var crew = new Crew(req.body);
  crew.image = Image.create(crew.image, req.files.image);

  var _image = [];
  crew.image.forEach(function (img) {
    _image.push(Image.promiseImageMeta(img.sysPathRetina));
  });

  Q.all(_image)
    .then(function (metaArray) {
      metaArray.forEach(function (meta, key) {
        crew.image[key].meta = Image.filterImageMeta(meta);
      });
      return Q.ninvoke(crew, 'save');
    })
    .then(function () {
      req.flash('success', msg.crew.created(crew.title));
      return res.redirect('/crew'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500
      req.flash('error', vErr);
      req.flash('crew', crew);
      return res.redirect('/crew/new'); // html
    });
}

/**
 * Update
 * POST /crew/:slug/edit
 */

exports.update = function (req, res, next) {
  Q.fcall(Image.update, Crew, { slug: req.params.slug }, 'image', req.body.image, req.files.image)
    .then(function (update) {
      return update; // update image
    })
    .then(function (updateData) {
      return Q.ninvoke(Crew, 'findOne', { slug: req.params.slug });
    })
    .then(function (crew) {
      if (!crew) return next(); // 404
      crew = _.extend(crew, _.omit(req.body, 'image'));
      res.locals.crew = crew;
      return Q.ninvoke(crew, 'save');
    })
    .then(function () {
      req.flash('success', msg.crew.updated(res.locals.crew.title));
      return res.redirect('/crew'); // html
    })
    .fail(function (err) {
      var vErr = validationErrors(err);
      if (!vErr) return next(err); // 500 
      req.flash('error', vErr);
      return res.redirect('/crew/' + req.params.slug + '/edit'); // html
    });
}

/**
 * changeLog index
 * GET /crew/:slug/log
 */

exports.log = function (req, res, next) {
  Q.ninvoke(Crew.index, 'findOne', { slug: req.params.slug })
    .then(function (crew) {
      if (!crew) return next(); // 404
      res.locals.crew = crew;
      return res.render('crew/log'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * changeLog restore
 * GET /crew/:slug/log/:__v/restore
 */
 
exports.restore = function (req, res, next) {
  Q.ninvoke(Crew.index, 'findOne', { slug: req.params.slug })
    .then(function (crew) {
      if (!crew || !crew.changeLog[req.params.__v]) return next(); // 404
      var image = crew.changeLog[req.params.__v].data.image;
      return Image.restore(Crew, { slug: req.params.slug }, 'image', image);
    })
    .then(function () {
      return Q.ninvoke(Crew.index, 'findOne', { slug: req.params.slug });
    })
    .then(function (crew) {
      if (!crew) return next(); // 404
      var data = _.omit(crew.changeLog[req.params.__v].data, '__v', 'image');
      data._meta = req.body._meta;
      crew = _.extend(crew, data);
      res.locals.crew = crew;
      return Q.ninvoke(crew, 'save');
    })
    .then(function () { 
      req.flash('success', msg.crew.restored(res.locals.crew.title, req.params.__v));
      return res.redirect('/crew'); // html
    })
    .fail(function (err) {
      return next(err); // 500
    });
}

/**
 * delete crew
 * DELETE /crew/:slug/delete
 * @rdarling
 *
 * **/

exports.delete = function (req, res, next) {
    Crew.find({slug: req.params.slug}).remove().exec();
    req.flash('success','Crew person deleted');
    return res.send(204);
}

