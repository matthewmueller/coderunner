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
  this.filename = join(volume, [obj.id, obj.revision].join('-') + '.js');

  Script.find(obj.id, function(err, script) {
    if (err) return io.emit('error', err);
    self.script = script;
    script.source(obj.src);
    self.save(next);
    self.write(next);
  });

  function next(err) {
    if (err) return io.emit('error', err);
    if (!--pending) self.run();
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

  fs.writeFile(this.filename, source, fn);
};

/**
 * Run the script
 */

Run.prototype.run = function() {
  console.log('running');
};
