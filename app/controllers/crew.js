
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
  , Image = mongoose.model('Image');


/**
 * Index
 * GET /crew
 * GET /crew/json
 */

exports.index = function (req, res) {
  Q.ninvoke(Crew.index, 'find')
    .then(function (crew) {
      res.locals.crew = crew;
      if (req.url.indexOf('/json') > -1) return res.send(stripObjects(crew));
      return res.render('crew');
    })
    .fail(function (err) {
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
      if (req.url.indexOf('/json') > -1) return res.send(stripObject(res.locals.crew['_doc']));
      return res.render('crew/show');
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

  crew.image.forEach(function (image, key) {
    if (req.files.image[key].name) {
      image = _.extend(image, req.files.image[key]);
      Q.fcall(fs.rename, image.tmpPath, image.sysPath)
        .then(function () {
          return true;
        })
        .fail(function (err) {
          console.log(err);
          return res.render('500');
        });
    } else if (req.files.image[key].path) {
      Q.fcall(fs.unlink, req.files.image[key].path)
        .then(function () {
          return true;
        })
        .fail(function (err) {
          console.log(err);
          return res.render('500');
        });
      image.remove();
    } else {
      image.remove();
    }
  });

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
  if (req.files.image[0].name && !req.body.image[0].name) {
    // new image and new data
    var _img = new Image(_.extend(req.files.image[0], req.body.image[0]));
  } else if (req.files.image[0].name && req.body.image[0].name) {
    // new image with old data
    var _img = new Image(_.extend(req.files.image[0], _.omit(req.body.image[0], 'name', 'type', 'size')));
  } else if (req.body.image[0].name) {
    // old image with potentially new data 
    var _img = new Image(req.body.image[0]);
  } else {
    // no image
    var _img = {};
  }

  if (req.files.image[0].name) {
    Q.fcall(fs.rename, _img.tmpPath, _img.sysPath)
      .then(function () {
        return true;
      })
      .fail(function (err) {
        console.log(err);
        return res.render('500');
      });
  } else if (req.files.image[0].path) {
    Q.fcall(fs.unlink, req.files.image[0].path)
      .then(function () {
        return true;
      })
      .fail(function (err) {
        console.log(err);
        return res.render('500');
      });
  }

  Q.ninvoke(Crew, 'update', { slug: req.params.slug }, { 'image.0' : _img })
    .then(function (data) {
      return Q.ninvoke(Crew, 'findOne', { slug: req.params.slug })
    })
    .then(function (crew) {
      if (!crew) return res.render('404');
      crew = _.extend(crew, _.omit(req.body, 'image'));
      return Q.ninvoke(crew, 'save');
    })
    .then(function () {
      req.flash('success', msg.crew.updated(req.body.firstName + ' ' + ( req.body.middleName ? req.body.middleName + ' ' : null ) + req.body.lastName));
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
