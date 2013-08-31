/**
 * Module Dependencies
 */

var debug = require('debug')('coderunner:node:installer');
var args = process.argv.slice(2);
var port = args[0] || 3000;
var exec = require('child_process').exec;
var axon = require('axon');
var escape = require('shell-escape');
var home = process.env.HOME;

/**
 * Set up the response socket
 */

var rep = axon
  .socket('rep')
  .format('json')
  .connect(port);

console.log('listening on port: %s', port);

/**
 * Listen for a dependency
 */

rep.on('message', install); 

/**
 * Install the dependency
 */

function install(dep, reply) {
  var self = this;
  var cmd = escape(['npm', 'install', '-s', dep]);

  debug('installing %s', dep);

  // install the dependency
  exec(cmd, { cwd: home }, function(err, stdout, stderr) {
    debug('executed npm, err: %s, stdout: %s, stderr: %s', err, stdout, stderr);
    reply(err, stdout, stderr);
  });
}
