
/**
 * Module dependencies.
 */

var contacts = require('../app/controllers/contacts')
  , users = require('../app/controllers/users')
  , home = require('../app/controllers/home');

module.exports = function(app) {
  
  // home
  app.get('/', home.index);

  // users and authentication
  app.get('/user/login', users.login);
  app.post('/user/login', users.authenticate);
  app.get('/user/signup', users.signup);
  app.post('/user/signup', users.create);

  // contacts
  app.get('/contact', contacts.index);
  app.post('/contact/save', contacts.create);

}
