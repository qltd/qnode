var crypto = require("crypto")
  , fs = require('fs')
  , path = require('path')
  , rootPath = path.normalize(__dirname + '/..')
  , contacts = require('../app/controllers/contacts');

// Bootstrap controllers
var controllers_path = rootPath + '/app/controllers';
  fs.readdirSync(controllers_path).forEach(function (file) {
  if (~file.indexOf('.js')) {
    console.log(file.slice(0,-3));
  }
})

module.exports = function(app) {
  app.get('/', function(req, res){
    res.render('home', { title: 'Q Design & Communication Since 1981' });
  });
  app.get('/login', function(req, res){
    var a = crypto.createHmac("md5", "password")
      .update("If you love node so much why don't you marry it?")
      .digest("hex");
    res.send(a);
    // res.render('login', { title: 'Q Admin Login' });
  });

  app.post('/contacts/save', contacts.create);
  app.get('/contacts', contacts.index);
}
