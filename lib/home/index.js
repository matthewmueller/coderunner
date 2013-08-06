/**
 * Module dependencies
 */

var debug = require('debug')('automon:home');
var express = require('express');
var app = module.exports = express();
var env = app.settings.env;
var docker = require('docker-io')('http://localhost:4243');
var superagent = require('superagent');
var Script = require('script/model');

/**
 * Config
 */

app.set('views', __dirname);
app.set('view engine', 'jade');

/**
 * Routes
 */

// development route
app.get('/sandbox', function(req, res, next) {
  if ('development' !== env) return next();
  var json = {};
  json.port = 8080;
  json.id = 'sandbox';
});

app.param('id', function(req, res, next, id) {
  Script.find(id, function(err, script) {
    if (err) return next(err);
    else if (!script) return res.redirect('/');
    req.script = script;
    next();
  });
});

// :id/:revision/edit? - load a revision
app.get('/:id/:revision/edit?', function(req, res, next) {
  var script = req.script;
  res.render('home', {
    script: JSON.stringify(script.toJSON())
  });
});

// :id - load the latest revision
app.get('/:id', function(req, res, next) {
  var id = req.params.id;
  var script = req.script;
  var latest = script.sources().length - 1;
  res.redirect('/' + id + '/' + latest + '/edit');
});

// Create a brand new container
app.get('/', function(req, res, next) {
  res.render('home');
});
