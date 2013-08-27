
/**
 * Module dependencies
 */

var auth = require('../app/middleware').authorization
  , msg = require('../config/messages');

/**
 * Controllers
 */

var clients = require('../app/controllers/clients')
  , contacts = require('../app/controllers/contacts')
  , crew = require('../app/controllers/crew')
  , errorLog = require('../app/controllers/errorLog')
  , home = require('../app/controllers/home')
  , panels = require('../app/controllers/panels')
  , projects = require('../app/controllers/projects')
  , services = require('../app/controllers/services')
  , users = require('../app/controllers/users');

module.exports = function(app, passport) {

  // home
  app.get('/', home.index);

  // user authentication
  app.get('/users/login', users.login);
  app.post('/users/login', passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: msg.user.authenticationFailed
  }), users.authenticate);
  app.get('/users/logout', users.logout);

  // error log
  app.all('/errorLog*', auth.requiresLogin, auth.requiresAdmin);
  app.get('/errorLog', errorLog.index);
  app.get('/errorLog/json', errorLog.index);

  // users
  app.all('/users*', auth.requiresLogin);
  app.get('/users', users.index);
  app.get('/users/json', auth.requiresAdmin, users.index);
  app.all('/users/new', auth.requiresAdmin);
  app.get('/users/new', users.new);
  app.post('/users/new', users.create);
  app.get('/users/:username', users.show);
  app.all('/users/:username*', auth.requiresSelf);
  app.get('/users/:username/json', users.show);
  app.get('/users/:username/edit', users.edit);
  app.post('/users/:username/edit', users.update);
  app.get('/users/:username/log', users.log);
  app.get('/users/:username/log/:__v', users.show);
  app.get('/users/:username/log/:__v/json', users.show);
  app.get('/users/:username/log/:__v/restore', users.restore);

  // contacts
  app.get('/contacts', auth.requiresLogin, contacts.index);
  app.get('/contacts/json', auth.requiresLogin, contacts.index);
  app.post('/contacts/new', contacts.create);

  // clients
  app.all('/clients*', auth.requiresLogin);
  app.get('/clients', clients.index);
  app.get('/clients/json', clients.index);
  app.get('/clients/new', clients.new);
  app.post('/clients/new', clients.create);
  app.get('/clients/:slug', clients.show);
  app.get('/clients/:slug/json', clients.show);
  app.get('/clients/:slug/edit', clients.edit);
  app.post('/clients/:slug/edit', clients.update);
  app.get('/clients/:slug/log', clients.log);
  app.get('/clients/:slug/log/:__v', clients.show);
  app.get('/clients/:slug/log/:__v/json', clients.show);
  app.get('/clients/:slug/log/:__v/restore', clients.restore);

  // crew
  app.all('/crew*', auth.requiresLogin);
  app.get('/crew', crew.index);
  app.get('/crew/json', crew.index);
  app.get('/crew/new', crew.new);
  app.post('/crew/new', crew.create);
  app.get('/crew/:slug', crew.show);
  app.get('/crew/:slug/json', crew.show);
  app.get('/crew/:slug/edit', crew.edit);
  app.post('/crew/:slug/edit', crew.update);
  app.get('/crew/:slug/log', crew.log);
  app.get('/crew/:slug/log/:__v', crew.show);
  app.get('/crew/:slug/log/:__v/json', crew.show);
  app.get('/crew/:slug/log/:__v/restore', crew.restore);

  // panels
  app.all('/panels*', auth.requiresLogin);
  app.get('/panels', panels.index);
  app.get('/panels/json', panels.index);
  app.get('/panels/new', panels.new);
  app.post('/panels/new', panels.create);
  app.get('/panels/:slug', panels.show);
  app.get('/panels/:slug/json', panels.show);
  app.get('/panels/:slug/edit', panels.edit);
  app.post('/panels/:slug/edit', panels.update);
  app.get('/panels/:slug/log', panels.log);
  app.get('/panels/:slug/log/:__v', panels.show);
  app.get('/panels/:slug/log/:__v/json', panels.show);
  app.get('/panels/:slug/log/:__v/restore', panels.restore);

  // projects
  app.get('/projects/:slug/json', projects.show);
  app.all('/projects*', auth.requiresLogin);
  app.get('/projects', projects.index);
  app.get('/projects/json', projects.index);
  app.get('/projects/new', projects.new);
  app.post('/projects/new', projects.create);
  app.get('/projects/:slug', projects.show);
  app.get('/projects/:slug/edit', projects.edit);
  app.post('/projects/:slug/edit', projects.update);
  app.get('/projects/:slug/log', projects.log);
  app.get('/projects/:slug/log/:__v', projects.show);
  app.get('/projects/:slug/log/:__v/json', projects.show);
  app.get('/projects/:slug/log/:__v/restore', projects.restore);

  // services
  app.all('/services*', auth.requiresLogin);
  app.get('/services', services.index);
  app.get('/services/json', services.index);
  app.get('/services/new', services.new);
  app.post('/services/new', services.create);
  app.get('/services/:slug', services.show);
  app.get('/services/:slug/json', services.show);
  app.get('/services/:slug/edit', services.edit);
  app.post('/services/:slug/edit', services.update);
  app.get('/services/:slug/log', services.log);
  app.get('/services/:slug/log/:__v', services.show);
  app.get('/services/:slug/log/:__v/json', services.show);
  app.get('/services/:slug/log/:__v/restore', services.restore);
}
