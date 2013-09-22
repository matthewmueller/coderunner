/**
 * Module dependencies
 */

var debug = require('debug')('coderunner:install');
var exec = require('child_process').exec;
var request = require('superagent');
var conf = require('conf');
var project = conf.project;
var args = require('args');

/**
 * Use docker?
 */

var docker = (false === args.docker) ? false : true;

/**
 * Export `Install`
 */

exports = module.exports = Install;

/**
 * Initialize `Install`
 */

function Install(dep, io) {
  if (!(this instanceof Install)) return new Install(dep, this);
  this.io = io;
  var action = (docker) ? 'install' : 'local';
  this[action](dep);
}

/**
 * Install the dependency
 *
 * @param {String} dep
 */

Install.prototype.install = function(dep) {
  var io = this.io;
  debug('installing dependency: %s', dep);

  // timeout after 20 seconds
  var timeout = setTimeout(function() {
    io.emit('error', new Error('timeout installing ' + dep));
  }, 20000);

  // send the dependency to node-installer
  request
    .post('http://localhost:3000/install/' + dep)
    .on('error', error)
    .end(function(res) {
      clearTimeout(timeout);
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
};

/**
 * Install the dependency locally
 *
 * @param {String} dep
 */

Install.prototype.local = function(dep) {
  var io = this.io;
  debug('locally installing dependency: %s', dep);

  exec('npm install -s ' + dep, { cwd: project }, function(err, stdout, stderr) {
    if (err) return io.emit('error', err);
    if (stderr) return io.emit('stderr', stderr);
    io.emit('installed', stdout || '');
  });
};
