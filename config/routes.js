var crypto = require("crypto")
  , fs = require('fs')
  , path = require('path')
  , rootPath = path.normalize(__dirname + '/..')
  , contacts = require('../app/controllers/contacts')
  , users = require('../app/controllers/users')
  , home = require('../app/controllers/home');

// Require controllers
var controllers_path = rootPath + '/app/controllers';
  fs.readdirSync(controllers_path).forEach(function (file) {
  if (~file.indexOf('.js')) {
    console.log(file.slice(0,-3));
  }
})

module.exports = function(app) {

  // home
  app.get('/', home.index);

  // users and authentication
  app.get('/users/login', users.login);

  // contacts
  app.post('/contacts/save', contacts.create);
  app.get('/contacts', contacts.index);

  // tests
  app.get('/crypto', function(req, res){
    var a = crypto.createHmac("md5", "password")
      .update("If you love node so much why don't you marry it?")
      .digest("hex");
    res.send(a);

  });
}
