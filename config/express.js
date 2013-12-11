
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoStore = require('connect-mongo')(express)
  , flash = require('connect-flash')
  , gzippo = require('gzippo')
  , middleware = require('../app/middleware');

module.exports = function(app, config, passport) {
  // for reverse proxying via nginx/apache
  app.enable('trust proxy');

  // all environments
  app.setMaxListeners(0);
  app.set('port', process.env.PORT || 3000);
  
  // static content and compression
  app.use(express.favicon(config.root + '/public/favicon.ico', {maxAge: 86400000}));
  app.use(gzippo.staticGzip(config.root + '/public', {maxAge: 86400000}));

  // stream compression
  app.use(gzippo.compress());
  
  // don't use logger for test env
  if (process.env.NODE_ENV !== 'test') {
    app.use(express.logger('dev'));
  }

  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');
  app.set('view options', {cache: true});

  app.use(express.cookieParser());
  app.use(express.bodyParser({ uploadDir: './tmp' }));
  app.use(express.methodOverride());

  // express/mongo session storage
  app.use(express.session({
    secret: 'L5(uAr+skeFMTFN',
    store: new mongoStore({
      url: 'mongodb://' + config.db.host + '/' + config.db.name,
      collection : 'sessions'
    })
  }));

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // connect flash for flash messages - should be declared after sessions
  app.use(flash());
  app.use(middleware.helpers);
  app.use(app.router);

  // private static content
  app.use('/client', express.static(config.root + '/private'));

  // error handling
  app.use(middleware.notFound);
  app.use(middleware.errorLog);
  app.use(middleware.errorRespond);
}
