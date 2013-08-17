/**
 * Module dependencies
 */

var codemirror = require('codemirror');
var debounce = require('debounce');
var acorn = require('acorn');
var Emitter = require('emitter');
var events = require('events');
var trim = require('trim');
var dependencies = require('dependencies');
// var Script = require('script');
// var history = require('history');
// var request = require('superagent');
var io = require('io');

/**
 * Import javascript mode
 */

require('codemirror-mode-javascript')(codemirror);

/**
 * Export `Script`
 */

module.exports = Script;

/**
 * Initialize `Script`
 *
 * @param {Element} textarea
 * @param {Script} script model
 * @param {Editor} editor component
 * @return {Script} script component
 * @api public
 */

function Script(textarea, script, editor) {
  if (!(this instanceof Script)) return new Script(script);
  this.model = script;
  this.editor = editor;
  this.textarea = textarea;
  this.installing = [];
  this.installed = [];
  this.cm = codemirror.fromTextArea(this.textarea);
  this.onrun = debounce(this.run.bind(this), 500, false);
  this.cm.on('change', this.onrun);
  this.io = io.channel();
  this.io.on('ran', this.ran.bind(this));
  this.io.on('stdout', this.stdout.bind(this));
  this.io.on('stderr', this.stderr.bind(this));
}

/**
 * Run the script
 *
 * @return {Script}
 * @api private
 */

Script.prototype.run = function() {
  var val = this.value();
  if (!val) return this;

  // trim
  val = trim(val);

  // try parsing, otherwise emit error
  try {
    acorn.parse(val);
  } catch(e) {
    this.io.emit('syntax error', e);
    return this;
  }

  // install the dependencies
  var deps = dependencies(val);
  for (var i = 0, len = deps.length; i < len; i++) {
    this.install(deps[i]);
  }

  // if we're still installing, do not run yet.
  if (this.installing.length) return this;

  // run the script
  this.io.emit('run', {
    src: val,
    id: this.model.primary(),
    revision: this.model.revision()
  });

  this.io.on('error', function(err) {
    console.error(err);
  });

  return this;
};

/**
 * Install the dependency
 *
 * @param {String} dep
 * @return {Script}
 * @api private
 */

Script.prototype.install = function(dep) {
  if (~this.installing.indexOf(dep) || ~this.installed.indexOf(dep)) return this;
  var self = this;
  var editor = this.editor;
  this.installing.push(dep);

  // split the channel
  var install = this.io.channel(dep);

  // install the dependency
  install.emit('install', dep);

  // stderr
  install.on('stderr', function(stderr) {
    editor.emit('stderr', stderr);
    var i = self.installing.indexOf(dep);
    if (~i) self.installing.splice(i, 1);
  });

  // stdout
  install.on('stdout', function(stdout) {
    editor.emit('stdout', stdout);
  });

  // installed the dependency
  install.on('installed', function() {
    var i = self.installing.indexOf(dep);
    if (~i) self.installing.splice(i, 1);
    self.installed.push(dep);
    editor.emit('installed', dep);
  });

  return this;
};



/**
 * Ran the script
 */

Script.prototype.ran = function() {

};

/**
 * Ran the script
 */

Script.prototype.stdout = function(stdout) {
  console.log('stdout', stdout);
};

/**
 * Ran the script
 */

Script.prototype.stderr = function(stderr) {
  console.log('stderr', stderr);
};

/**
 * Get the value of the textarea
 */

Script.prototype.value = function(val) {
  if (val) this.cm.setValue(val);
  else return this.cm.getValue();
  return this;
};
