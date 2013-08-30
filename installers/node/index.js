/**
 * Module Dependencies
 */

var args = process.argv.slice(2);
var port = args[0] || 80;
var express = require('express');
var engine = require('engine.io');
var IO = require('io-server');
var app = express();
var es = new engine.Server();
var server = require('http').createServer(app);

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

server.listen(port);
console.log('Server started on port', port);
