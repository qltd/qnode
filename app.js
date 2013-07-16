
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , nodemailer = require('nodemailer')
  , passport = require('passport');

// passport configuration
require('./config/passport')(passport);

var app = express();

// express configuration
require('./config/express')(app);

// routes configuration
require('./config/routes')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
