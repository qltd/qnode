
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

var Client = mongoose.model('Client')
  , Image = mongoose.model('Image');

/**
 * Index
 * GET /clients
 */

exports.index = function (req, res) {
  Q.ninvoke(Client.index, 'find')
    .then(function (clients) {
      res.locals.clients = clients;
      return res.render('clients');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Show
 * GET /clients/:slug
 * GET /clients/:slug/log/:__v
 */

exports.show = function (req, res) {
  Q.ninvoke(Client, 'findOne', { slug: req.params.slug })
    .then(function (client) {
      if (!client) return res.render('404');
      res.locals._client = ( req.params.__v && client.changeLog[req.params.__v] ? _.extend(client, client.changeLog[req.params.__v].data) : client );
      return res.render('clients/show');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * New
 * GET /clients/new
 */

exports.new = function (req, res) {
  Q.fcall(function () {
    var clients = req.flash('client');
    return ( clients && clients.length && clients[clients.length-1] ? clients[clients.length-1] : new Client() );
  })
    .then(function (client) {
      res.locals._client = client; // use '_client' because 'client' namespace is occupied, and modifying it will break jade
      return res.render('clients/new', { 
        pageHeading: 'Create Client'
      });
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Edit
 * GET /clients/:slug/edit
 */

exports.edit = function (req, res) {
  Q.ninvoke(Client, 'findOne', { slug: req.params.slug })
    .then(function (client) {
      if (!client) return res.render('404');
      res.locals._client = client;
      return res.render('clients/edit');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * Create
 * POST /clients/new
 */

exports.create = function (req, res) {
  var client = new Client(req.body);

  client.image.forEach(function (image, key) {
    if (req.files.image[key].name) {
      image = _.extend(image, req.files.image[key]);
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

  Q.ninvoke(client, 'save')
    .then(function () {
      req.flash('success', msg.client.created(client.title));
      return res.redirect('/clients');
    })
    .fail(function (err) {
      req.flash('error', utils.errors(err));
      req.flash('client', client);
      return res.redirect('/clients/new');
    });
}

/**
 * Update
 * POST /clients/:slug/edit
 */

exports.update = function (req, res) {

  // build new image to replace current image subdoc; these are immutable during a normal find and save operation
  if (req.body.image['current'] && req.body.image['current'][0]) { 
    _img = new Image(req.body.image['current'][0]);
    console.log(_img);
  } else {
    _img = {};
  }

  Q.ninvoke(Client, 'update', { slug: req.params.slug }, { 'image.0' : _img })
    .then(function (data) {
      return Q.ninvoke(Client, 'findOne', { slug: req.params.slug })
    })
    .then(function (client) {
      if (!client) return res.render('404');
      client = _.extend(client, _.omit(req.body, 'image'));
      return Q.ninvoke(client, 'save');
    })
    .then(function () {
      req.flash('success', msg.client.updated(req.body.title));
      return res.redirect('/clients');
    })
    .fail(function (err) {
      console.log(err);
      req.flash('error', utils.errors(err));
      return res.redirect('/clients/' + req.params.slug + '/edit');
    });
}

/**
 * changeLog index
 * GET /clients/:slug/log
 */

exports.log = function (req, res) {
  Q.ninvoke(Client.index, 'findOne', { slug: req.params.slug })
    .then(function (client) {
      if (!client) return res.render('404');
      res.locals._client = client;
      return res.render('clients/log');
    })
    .fail(function (err) {
      return res.render('500');
    });
}

/**
 * changeLog restore
 * GET /clients/:slug/log/:__v/restore
 */
 
exports.restore = function (req, res) {
  Q.ninvoke(Client.index, 'findOne', { slug: req.params.slug })
    .then(function (client) {
      if (!client) return res.render('404');
      data = _.omit(client.changeLog[req.params.__v].data, '__v');
      data._meta = req.body._meta;
      client = _.extend(client, data);
      return Q.ninvoke(client, 'save');
    })
    .then(function () {
      req.flash('success', msg.client.restored(data.title, req.params.__v));
      return res.redirect('/clients');
    })
    .fail(function (err) {
      return res.render('500');
    });
}
