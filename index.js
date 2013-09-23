/**
 * Module dependencies.
 */

var path = require('path');
var join = path.join;
var express = require('express');
var app = module.exports = express();
var server = require('http').createServer(app);
var Session = require('connect-leveldb')(express);
var engine = require('engine.io');
var IO = require('io-server');
var build = require('build').build;
var conf = require('conf');
var args = require('args');
var port = args.port || 8080;

/**
 * Set up engine.io
 */

var es = new engine.Server();

server.on('upgrade', function(req, socket, head) {
  es.handleUpgrade(req, socket, head);
});

es.on('connection', IO);

/**
 * Configuration
 */

app.use(express.favicon());
app.use(express.bodyParser());
app.use('/engine.io', es.handleRequest.bind(es));

app.configure('production', function() {
  app.use(express.compress());
});

app.configure('development', function(){
  app.use(require('build'));
  app.use(express.logger('dev'));
});

app.use(express.static(__dirname + '/build'));

/**
 * Session support
 */

var dbdir = conf['db path'];
var session = new Session({
  dbLocation: join(dbdir, 'sessions'),
  ttl : 60 * 60 // 1hr
});

app.use(express.cookieParser());
app.use(express.session({
  store: session,
  secret: conf['session secret'] || 'leveldb secret'
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

IO.on('install', require('install'));
IO.on('run', require('run'));

app.use(require('home'));

/**
 * Environment configurations
 */

app.configure('development', function() {
  app.use(express.errorHandler());
});

// TODO: make more user-friendly & log
app.configure('production', function() {
  // build once
  build(function(err) {
    if (err) throw(err);
  });

  app.use(function(err, req, res, next) {
    res.redirect('/');
  });
});

/**
 * Listen
 */

server.listen(port, function() {
  console.log('listening on port %s', port);
});

/**
 * Graceful shutdown
 */

function shutdown() {
  console.log('server: shutting down');
  server.close(function(){
    console.log('server: exiting');
    setTimeout(function() {
      process.exit();
    }, 2000);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGQUIT', shutdown);
