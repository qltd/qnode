
/**
 * Module dependencies.
 */

var contacts = require('../app/controllers/contacts')
  , users = require('../app/controllers/users')
  , home = require('../app/controllers/home');

module.exports = function(app) {
  
  // home
  app.get('/', home.index);
  app.get('/admin', home.admin);

  // users and authentication
  app.get('/user/new', users.new);
  app.post('/user/new', users.create);
  app.get('/user/login', users.login);
  app.post('/user/login', users.authenticate);

  // contacts
  app.get('/contact', contacts.index);
  app.post('/contact/new', contacts.create);

}
