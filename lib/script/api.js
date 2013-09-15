/**
 * Module Dependencies
 */

var debug = require('debug')('coderunner:script:api');
var fs = require('fs');
var port = process.argv[2] || 9000;
var express = require('express');
var app = module.exports = express();
var Script = require('./model.js');
var uid = require('uid');
var config = require('config');

/**
 * API
 */

// Create the script
app.post('/script', function(req, res, next) {
  var body = req.body;
  var revision = body.revision;
  var script = new Script(body);
  script.id(uid(8));

  script.save(function(err) {
    // Handle response
    if (err) return res.send({ error: err });

    // save scripts in the session
    req.session.scripts.push(script.url());
    debug('creating script: %s, session: %j', script.url(), req.session.scripts);

    // response
    res.send(script.toJSON());
  });
});

app.param('id', function(req, res, next, id) {
  Script.find(id, function(err, script) {
    // TODO: return next(err), then catch errors at once with req.xhr
    if (err) return res.send({ error: err });
    req.script = script;
    next();
  });
});

// Update the script
app.put('/script/:id', function(req, res, next) {
  var script = req.script;
  var body = req.body;
  var revision = req.body.revision;
  var sources = body.sources;
  var src = sources[revision];
  var url = script.url(revision);
  var volume = config('script volume');

  if (undefined == src) return res.send(200);

  // check if creator is editing
  debug('updating script: %s, session: %j', url, req.session.scripts)
  var creator = !!~req.session.scripts.indexOf(url);

  if (!creator) {
    revision = sources.length;
    url = script.url(revision);
    debug('not creator, bumping revision, url: %s', url);
    req.session.scripts.push(url);
  }

  var filename = volume + script.slug(revision) + '.js';
  fs.writeFile(filename, src, function(err) {
    if (err) return next(err);

    script.source(src, revision);
    script.save(function(err) {
      if (err) return res.send({ error: err });
      var json = script.toJSON();
      json.revision = revision;
      res.send(json);
    });

  });
});

/**
 * Listen
 */

if(!module.parent) {
  app.listen(port);
  console.log('Server started on port', port);
}
