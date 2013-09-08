/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var join = path.join;
var readfile = require('cached-readfile');
var Script = require('script/model');
var config = require('config');
var volume = config('script volume');
var superagent = require('superagent');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var ms = require('ms');

/**
 * Path to cid files
 */

var cids = join(__dirname, '/../../cids');

/**
 * Export `Run`
 */

module.exports = Run;

/**
 * Initialize `Run`
 */

function Run(obj, io) {
  if (!(this instanceof Run)) return new Run(obj, this);
  this.io = io;
  var self = this;
  var pending = 2;
  var revision = obj.revision;

  Script.find(obj.id, function(err, script) {
    if (err) return io.emit('error', err);
    var filename = script.slug(revision) + '.js';
    self.run(filename, function(err) {
      if (err) io.emit('error', err);
      io.emit('ran');
    });
  });
}

/**
 * Run the script
 *
 * @param {String} filename
 * @param {Function} fn
 * @return Runner
 * @api public
 */

Run.prototype.run = function(filename, fn) {
  var self = this;
  var io = this.io; 
  var args = [];
  args.push('docker');
  args.push('run');
  args.push('-v');
  args.push([volume, '/home'].join(':'));

  // add memory limit (5mb)
  // Not supported in ubuntu 12.04, try with 13.04
  // args.push('-m');
  // args.push('5242880');

  // add a cpu limit (10%)
  args.push('-c');
  args.push(100);

  readfile(join(cids, 'node-installer'), 'utf8', function(err, cid) {
    if (err) return io.emit('error', err);
    
    // super big hack to make sure installer is running, otherwise
    // don't use volumes-from
    exec('docker inspect ' + cid, function(err, stdout, stderr) {
      if (err) return io.emit('error', err);

      // Try adding the installer volume
      try {
        if (!stderr && JSON.parse(stdout)[0].State.Running) {
          args.push('-volumes-from');
          args.push(cid);
        }
      } catch(e) {}

      args.push('node-runner');
      args.push('node');
      args.push(join('/home', filename));

      var opts = {
        timeout: ms('15s')
      };

      var node = exec(args.join(' '), opts, function(err, stdout, stderr) {
        if (err) return fn(err);
        if (stdout) io.emit('stdout', stdout);
        if (stderr) io.emit('stderr', stderr);
      });

      // close stdin immediately so we don't wait on it
      node.stdin.end();
    });
  });
};
