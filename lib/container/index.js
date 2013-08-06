/**
 * Module Dependencies
 */

var port = process.argv[2] || 9000;
var express = require('express');
var app = module.exports = express();
var docker = require('docker-io')('http://localhost:4243');
var debug = require('debug')('automon:container');
var sandbox = process.env.SANDBOX ? process.env.SANDBOX : false;

/**
 * API
 */

// Create a container
app.post('/containers', function(req, res, next) {
  var json = {};
  var container = docker.container('node-sandbox');

  // Are we running the sandbox locally?
  if (sandbox) {
    json.id = 'sandbox';
    json.port = sandbox;
    return res.send(json);
  }

  // This is going to cause problems... with around 900 connections
  container.port(80);
  var publicPort = container.json.PortSpecs[0].split(':')[0];

  // Fire up the container
  container.run(function(err) {
    if (err) return res.send(500, { error: err });
    json.id = container.id;
    json.port = publicPort;
    res.send(json);
  });
});

// Kill and remove the container
app.get('/containers/:id/kill', function(req, res, next) {
  // return immediately
  res.send(200);

  var id = req.params.id;
  debug('removing container %s', id);
  docker.container.remove(id, function(err) {
    if (err) debug('error removing container %j', err);
  });
});

/**
 * Listen
 */

if(!module.parent) {
  app.listen(port);
  console.log('Server started on port', port);
}
