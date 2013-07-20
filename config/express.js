
/**
 * Module dependencies.
 */

var express = require('express')
  , MongoStore = require('connect-mongo')(express)
  , path = require('path')
  , rootPath = path.normalize(__dirname + '/..');

module.exports = function(app) {
  // all environments
  app.setMaxListeners(0);
  app.set('port', process.env.PORT || 3000);
  app.set('views', rootPath + '/app/views');
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
  app.use(require('stylus').middleware(rootPath + '/public'));
  app.use(express.static(path.join(rootPath, 'public')));

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  // for reverse proxying via nginx/apache
  app.enable('trust proxy');
}
