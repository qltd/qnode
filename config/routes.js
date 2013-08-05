
/**
 * Module dependencies.
 */

var contacts = require('../app/controllers/contacts')
  , users = require('../app/controllers/users')
  , home = require('../app/controllers/home')
  , panels = require('../app/controllers/panels')
  , projects = require('../app/controllers/projects');

module.exports = function(app, passport) {
  
  // home
  app.get('/', home.index);
  app.get('/admin', home.admin);

  // users and authentication
  app.get('/user', users.index);
  app.get('/user/new', users.new);
  app.post('/user/new', users.create);
  app.get('/user/login', users.login);
  app.post('/user/login',  passport.authenticate('local', {
    failureRedirect: '/user/login',
    failureFlash: 'Username or password is incorrect!'
  }), users.authenticated);

  // contacts
  app.get('/contact', contacts.index);
  app.post('/contact/new', contacts.create);

  // panels
  app.get('/panel', panels.index);
  app.get('/panel/new', panels.new);
  app.post('/panel/new', panels.create);

  // projects
  app.get('/project', projects.index);
  app.get('/project/new', projects.new);
  app.post('/project/new', projects.create);

  // 404
  app.get('*', function(req,res) {
    res.render('404');
  });
}
