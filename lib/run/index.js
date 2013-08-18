/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var join = path.join;
var Script = require('script/model');
var config = require('config');
var volume = config('script volume');
var superagent = require('superagent');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

/**
 * Export `Run`
 */

module.exports = Run;

/**
 * Initialize `Run`
 */

function Run(obj, io) {
  if (!(this instanceof Run)) return new Run(obj, this);
  var self = this;
  var pending = 2;
  this.io = io;
  this.filename = [obj.id, obj.revision].join('-') + '.js';

  Script.find(obj.id, function(err, script) {
    if (err) return io.emit('error', err);
    self.script = script;
    script.source(obj.src);
    self.save(next);
    self.write(next);
  });

  function next(err) {
    if (err) return io.emit('error', err);
    if (!--pending) self.run(function(err) {
      console.log('err', err);
    });
  }
}

/**
 * Save the file
 *
 * @param {Function} fn
 * @return {Run}
 * @api private
 */

Run.prototype.save = function(fn) {
  var script = this.script;
  script.save(fn);
};

/**
 * Write the file to script volume
 *
 * @param {Function} fn
 * @return {Run}
 * @api private
 */

Run.prototype.write = function(fn) {
  var script = this.script;
  var source = script.source();
  console.log(source);
  var filename = path.join(volume, this.filename);
  console.log('filename', filename);
  fs.writeFile(filename, source, fn);
};

/**
 * Run the script
 */

Run.prototype.run = function(fn) {
  var io = this.io; 
  var args = [];
  args.push('docker');
  args.push('run');
  args.push('-v');
  args.push([volume, '/home'].join(':'));
  args.push('node-runner');
  args.push(join('/home', this.filename));

  var node = exec(args.join(' '), function(err, stdout, stderr) {
    if (err) console.log('err', err);
    if (stdout) console.log('stdout', stdout);
    if (stderr) console.log('stderr', stderr);
  });

  // close stdin immediately so we don't wait for it
  node.stdin.end();
};
