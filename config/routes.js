
var auth = require('../app/middleware').authorization;

/**
 * Controllers
 */

var contacts = require('../app/controllers/contacts')
  , users = require('../app/controllers/users')
  , home = require('../app/controllers/home')
  , panels = require('../app/controllers/panels')
  , projects = require('../app/controllers/projects')
  , services = require('../app/controllers/services');

module.exports = function(app, passport) {

  // home
  app.get('/', home.index);

  // users and authentication
  app.get('/user', users.index);
  app.get('/user/new', users.new);
  app.post('/user/new', users.create);
  app.get('/user/login', users.login);
  app.post('/user/login',  passport.authenticate('local', {
    failureRedirect: '/user/login',
    failureFlash: 'Username or password is incorrect!'
  }), users.login.success);
  app.get('/user/logout', users.logout);

  // contacts
  app.get('/contact', auth.requiresLogin, contacts.index);
  app.post('/contact/new', contacts.create);

  // panels
  app.all('/panel*', auth.requiresLogin);
  app.get('/panel', panels.index);
  app.get('/panel/new', panels.new);
  app.post('/panel/new', panels.create);
  app.get('/panel/:slug', panels.show);
  app.get('/panel/:slug/edit', panels.edit);
  app.post('/panel/:slug/edit', panels.update);
  app.get('/panel/:slug/log', panels.log);

  // projects
  app.all('/project*', auth.requiresLogin);
  app.get('/project', projects.index);
  app.get('/project/new', projects.new);
  app.post('/project/new', projects.create);

  // services
  app.all('/service*', auth.requiresLogin);
  app.get('/service', services.index);
  app.get('/service/new', services.new);
  app.post('/service/new', services.create);
  app.get('/service/:slug', services.show);
  app.get('/service/:slug/edit', services.edit);
  app.post('/service/:slug/edit', services.update);
  app.get('/service/:slug/log', services.log);

  // 404
  app.all('*', function (req,res) {
    res.render('404');
  });
}
