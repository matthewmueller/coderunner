/**
 * Module dependencies
 */

var exec = require('child_process').exec;
var IO = require('io-component');
var axon = require('axon');

/**
 * Export `Install`
 */

exports = module.exports = Install;

/**
 * Bind to installers
 */

var node = axon
  .socket('req')
  .format('json')
  .bind(3000);

node.on('disconnect', function() {
  console.log('client disconnected');
});

node.on('connect', function() {
  console.log('client connected');
});

/**
 * Initialize `Install`
 */

function Install(dep, io) {
  if (!(this instanceof Install)) return new Install(dep, this);
  console.log('sending dependency: %s', dep);
  // send the dependency to node-installer
  node.send(dep, function(err, stdout, stderr) {
    if (err) return io.emit('error', err);
    if (stdout) io.emit('stdout', stdout);
    if (stderr) io.emit('stderr', stderr);
  });
}
