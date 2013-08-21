/**
 * Module dependencies
 */

var home = process.env.HOME;
var spawn = require('child_process').spawn;

/**
 * Expose `install`
 */

module.exports = Install;

/**
 * Install a dependency
 */

function Install(dep, io) {
  if (!(this instanceof Install)) return new Install(dep, this);
  this.io = io;
  this.install(dep);
}

/**
 * Install the dependency
 */

Install.prototype.install = function(dep) {
  var self = this;
  var npm = spawn('npm', ['install', '-s', dep], {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: home  
  });

  npm.stdout.on('data', function(stdout) {
    self.io.emit('stdout', stdout.toString());
  });

  npm.stderr.on('data', function(stderr) {
    self.io.emit('stderr', stderr.toString());
  });

  npm.on('close', function(code) {
    if (code !== 0) self.io.emit('error', new Error('npm install exited with ' + code));
    else self.io.emit('installed', dep);
  });
};
