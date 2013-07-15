
/**
 * Module dependencies.
 */

var express = require('express')
  , hash = require('./pass').hash
  , routes = require('./routes')
  , user = require('./routes/user')
  , post = require('./routes/post')
  , http = require('http')
  , path = require('path')
  , nodemailer = require('nodemailer');

var app = express();

// all environments
app.setMaxListeners(0);
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {
  layout: false
});
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('L5(uAr+skeFMTFN'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/admin', post.contactUsIndex);
app.post('/contactUsPost', post.contactUsForm);
app.get('/login', function(req, res){
  res.render('login', { title: 'Q Design & Communication Since 1981' });
});


// for reverse proxying via nginx/apache
app.enable('trust proxy');

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});