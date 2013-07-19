
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , http = require('http')
  , mongoose = require('mongoose')
  , nodemailer = require('nodemailer')
  , passport = require('passport');

// db connection
var dbName = 'qltd-db';
mongoose.connect('mongodb://localhost/' + dbName);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('Connected to MongoDB, and using a database named ' + dbName);
});

// load models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

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
