var crypto = require("crypto");

module.exports = function(app) {
  app.get('/', function(req, res){
    res.render('index', { title: 'Q Design & Communication Since 1981' })
  });
  app.get('/login', function(req, res){
    var a = crypto.createHmac("md5", "password")
      .update("If you love node so much why don't you marry it?")
      .digest("hex");
    res.send(a);
    // res.render('login', { title: 'Q Admin Login' });
  });
}
