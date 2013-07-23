
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoStore = require('connect-mongo')(express)
  , flash = require('connect-flash');

module.exports = function(app, config, passport) {
  // all environments
  app.setMaxListeners(0);
  app.set('port', process.env.PORT || 3000);
  
  app.use(express.favicon());
  app.use(require('stylus').middleware(config.root + '/public'));
  app.use(express.static(config.root + '/public'));

  // don't use logger for test env
  if (process.env.NODE_ENV !== 'test') {
    app.use(express.logger('dev'))
  }

  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');

  app.configure(function() {

    app.use(express.cookieParser());

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // express/mongo session storage
    app.use(express.session({
      secret: 'L5(uAr+skeFMTFN',
      store: new mongoStore({
        url: 'mongodb://'+ config.db.host +'/' + config.db.name,
        collection : 'sessions'
      })
    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // connect flash for flash messages - should be declared after sessions
    app.use(flash());

    app.use(app.router);
  });

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  // for reverse proxying via nginx/apache
  app.enable('trust proxy');
}
