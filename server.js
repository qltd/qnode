
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , http = require('http')
  , mongoose = require('mongoose')
  , nodemailer = require('nodemailer')
  , passport = require('passport');

// load environment-specific configuration; default to 'development' if unspecified
var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env];

// db connection
mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('Connected to MongoDB -- host: ' + config.db.host + ', name: ' + config.db.name);
});

// load models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});

// passport configuration
require('./config/passport')(passport);

var app = express();

// express configuration
require('./config/express')(app, config, passport);

// routes configuration
require('./config/routes')(app, passport);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
