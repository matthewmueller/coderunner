/**
 * Module dependencies
 */

var exec = require('child_process').exec;
var IO = require('io-component');

/**
 * Export `Install`
 */

exports = module.exports = Install;

/**
 * TODO: manage with mongroup, use axon to connect, maintain same port 
 * 
 * Start the node-installer
 */

function open() {
  console.log('ready to go');
}

var node = IO();

exec('docker run -d -t node-installer', function(err, id, stderr) {
  if (err) throw err;
  else if (stderr) throw new Error(stderr);

  // UBER HACK just to get things working
  exports.node_installer = id;

  // Get the port
  exec('docker inspect ' + id, function(err, stdout, stderr) {
    if (err) throw err;
    else if (stderr) throw new Error(stderr);
    try {
      var json = JSON.parse(stdout);
      var port = json[0].NetworkSettings.PortMapping.Tcp[80];
      // port = 9090;
      node.connect('http://localhost:' + port);
      node.socket.on('open', open);
      if (!port) throw new Error('node-installer public port not found.');
    } catch(e) {
      throw e;
    }
  });
});

/**
 * Initialize `Install`
 */

function Install(dep, io) {
  if (!(this instanceof Install)) return new Install(dep, this);
  this.io = io;
  this.installer = node.channel();
  this.installer.on('stdout', this.stdout.bind(this));
  this.installer.on('stderr', this.stderr.bind(this));
  this.installer.on('installed', this.installed.bind(this));
  this.install(dep);
}

/**
 * install the dependency
 */

Install.prototype.install = function(dep) {
  console.log('fe server. installing dep: %s', dep);
  this.installer.emit('install', dep);
};

/**
 * Stdout
 */

Install.prototype.stdout = function(stdout) {
  this.io.emit('stdout', stdout);
};

/**
 * Stderr
 */

Install.prototype.stderr = function(stderr) {
  this.io.emit('stderr', stderr);
};

/**
 * Installed the dependency
 */

Install.prototype.installed = function() {
  this.io.emit('installed');
};
