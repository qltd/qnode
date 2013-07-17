
var crypto = require('crypto')
  , contacts = require('../app/controllers/contacts')
  , users = require('../app/controllers/users')
  , home = require('../app/controllers/home');

module.exports = function(app) {
  
  // home
  app.get('/', home.index);

  // users and authentication
  app.get('/user/login', users.login);
  app.post('/user/login', users.authenticate);

  // contacts
  app.get('/contact', contacts.index);
  app.post('/contact/save', contacts.create);

  // crypto tests
  app.get('/crypto/:id', function(req, res){
    var a = crypto.createHmac("sha512", req.params.id)
      .update(req.params.id)
      .digest("base64");
    res.send(a);
  });
}
