/**
 * Module dependencies
 */

var path = require('path');
var join = path.join;
var debug = require('debug')('coderunner:home');
var express = require('express');
var app = module.exports = express();
var env = app.settings.env;
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

app.param('id', function(req, res, next, id) {
  Script.find(id, function(err, script) {
    if (err) console.log('oh noz');
    if (err) return next(err);
    else if (!script) return res.redirect('/');
    req.script = script;
    next();
  });
});

// redirect to /:id/:revision/edit for now
app.get('/:id/:revision', function(req, res, next) {
  res.redirect(join(req.url, 'edit'));
});

// :id/:revision/edit? - load a revision
app.get('/:id/:revision/edit?', function(req, res, next) {
  var script = req.script;
  var host = req.host;

  res.render('home', {
    script: JSON.stringify(script.toJSON()),
    title: host
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
  var host = req.host;
  res.render('home', {
    title: host
  });
});

app.get('*', function(req, res, next) {
  res.redirect('/');
});
