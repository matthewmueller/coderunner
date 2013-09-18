/**
 * Module dependencies
 */

var debug = require('debug')('coderunner:install');
var exec = require('child_process').exec;
var request = require('superagent');

/**
 * Export `Install`
 */

exports = module.exports = Install;

/**
 * Initialize `Install`
 */

function Install(dep, io) {
  if (!(this instanceof Install)) return new Install(dep, this);
  debug('installing dependency: %s', dep);

  // send the dependency to node-installer
  request
    .post('http://localhost:3000/install/' + dep)
    .on('error', error)
    .end(function(res) {
      var body = res.body;

      if (!res.ok) {
        debug('error installing %s: %j', dep, body);
        if (body.error) io.emit('error', body.error);
        else if (body.stderr) io.emit('stderr', body.stderr);
      } else {
        debug('installed: %s', dep);
        io.emit('installed', body.stdout);
      }
    });

  function error(err) {
    debug('error installing %s: %j', dep, err);
    io.emit('error', err);
  }
}
