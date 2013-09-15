/**
 * Module Dependencies
 */

var debug = require('debug')('coderunner:node:installer');
var args = process.argv.slice(2);
var port = args[0] || 3000;
var express = require('express');
var app = module.exports = express();
var exec = require('child_process').exec;
var escape = require('shell-escape');

/**
 * Core node modules
 *
 * List at: https://github.com/joyent/node/blob/master/lib/repl.js#L73
 */

var core = [ 'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns', 
             'domain', 'events', 'fs', 'http', 'https', 'net', 'os', 'path', 'punycode',
             'querystring', 'readline', 'stream', 'string_decoder', 'tls', 'tty', 'url',
             'util', 'vm', 'zlib', 'smalloc'];

var rcore = new RegExp(core.join('|'), 'i');

/**
 * Routes
 */

app.post('/install/:dep', function(req, res, next) {
  var self = this;
  var dep = req.params.dep;

  if (rcore.test(dep)) return res.send(200);

  var cmd = escape(['npm', 'install', '-s', dep]);
  debug('installing %s', dep);

  // install the dependency
  exec(cmd, { cwd: '/' }, function(err, stdout, stderr) {
    debug('executed npm, err: %s, stdout: %s, stderr: %s', err, stdout, stderr);
    if (err) res.send(500, { error: err });
    else if (stderr) res.send(500, { stderr: stderr });
    else res.send(200, { stdout: stdout });
  });
});

/**
 * Graceful shutdown
 */

function shutdown() {
  console.log('server: shutting down');
  server.close(function(){
    console.log('server: exiting');
    process.exit();
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGQUIT', shutdown);

/* 
 * Bind to a port
 */

app.listen(port, function() {
  console.log('listening on port: %s', port);
});
