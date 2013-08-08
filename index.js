/**
 * Module dependencies.
 */

var port = process.argv[2] || 8080;
var express = require('express');
var app = module.exports = express();
var Session = require('connect-leveldb2')(express);
var config = require('config');

/**
 * Project path
 */

process.env.PROJECT_PATH = __dirname;

/**
 * Configuration
 */

app.use(express.favicon());
app.use(express.bodyParser());

app.configure('production', function() {
  app.use(express.compress());
});

app.configure('development', function(){
  app.use(require('build'));
  app.use(express.logger('dev'));
});

app.use(express.static(__dirname + '/build'));

// Needs to be above req.session because of the way sessions work
// See: https://github.com/senchalabs/connect/issues/854
app.use(require('container'));

/**
 * Session support
 */

var dbdir = config('db path');
var session = new Session({
  dbLocation: dbdir + 'sessions',
  ttl : 60 * 60 // 1hr
});

app.use(express.cookieParser());
app.use(express.session({
  store: session,
  secret: 'leveldb sweetness'
}));

// session defaults
app.use(function(req, res, next) {
  if (!req.session.scripts) req.session.scripts = [];
  next();
});

/**
 * Mount
 */

app.use(require('script/api'));
app.use(require('home'));

/**
 * Environment configurations
 */

app.configure('development', function() {
  app.use(express.errorHandler());
});

// TODO: make more user-friendly & log
app.configure('production', function() {
  app.use(function(err, req, res, next) {
    res.redirect('/');
  });
});

/**
 * Listen
 */

var server = app.listen(port, function() {
  console.log('listening on port %s', port);
});

/**
 * Graceful shutdown
 */

function shutdown() {
  console.log('closing...');
  server.close();
  // redis.client.quit();

  // arbitrary 2 seconds
  setTimeout(function() {
    console.log('closed');
    process.exit(0);
  }, 2000);
}

process.on('SIGTERM', shutdown);
process.on('SIGQUIT', shutdown);
