/**
 * Module Dependencies
 */

var express = require('express'),
    engine = require('engine.io'),
    IO = require('io-server'),
    app = express(),
    es = new engine.Server(),
    server = require('http').createServer(app);

/**
 * Handle the upgrade
 */

server.on('upgrade', function(req, socket, head) {
  es.handleUpgrade(req, socket, head);
});

/**
 * Configuration
 */

app.configure(function() {
  app.use(express.logger('dev'));
  app.use(express.query());
  app.use('/engine.io', es.handleRequest.bind(es));
  app.use(express.errorHandler());
});

/**
 * Handle the connection
 */

es.on('connection', IO);

/**
 * Routing
 */

IO.on('install', require('./install'));

/**
 * Bind to port
 */

server.listen(80);
console.log('Server started on port 80');
