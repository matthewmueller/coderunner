/**
 * Module dependencies
 */

var debug = require('debug')('coderunner:editor:script');
var codemirror = require('codemirror');
var debounce = require('debounce');
var acorn = require('acorn');
var Emitter = require('emitter');
var events = require('events');
var trim = require('trim');
var dependencies = require('dependencies');
var superagent = require('superagent');
var history = require('history');
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
  var self = this;
  this.model = script;
  this.editor = editor;
  this.textarea = textarea;
  this.installing = [];
  this.installed = [];
  this.cm = codemirror.fromTextArea(this.textarea);

  // Add the value to the script
  if (!this.model.isNew()) {
    this.value(this.model.source());
  }

  this.cm.on('change', this.onchange.bind(this));
  this.io = io.channel();

  this.editor.on('run', this.run.bind(this));
}

/**
 * On codemirror change
 *
 * @return Script
 * @api private
 */

Script.prototype.onchange = debounce(function() {
  var self = this;
  var editor = this.editor;
  var model = this.model;

  this.save(function(err) {
    if (err) return editor.emit('error', err);
    self.run();
  });
}, 500);

/**
 * Save the script
 *
 * @param {Function} fn
 * @return Script
 * @api public
 */

Script.prototype.save = function(fn) {
  fn = fn || function() {};
  var model = this.model;
  var editor = this.editor;
  var revision = model.revision();
  var val = this.value();
  if (!val) return fn();

  // trim the value
  val = trim(val);

  // update the source
  model.source(val);

  // save the model
  model.save(function(err) {
    if (err) return fn(err); 
    var rev = model.revision();
    // bump the revision, if we were not original creator
    if (revision !== rev) history.push(model.url(rev) + '/edit');
    return fn();
  });
}

/**
 * Validate the source
 *
 * @param {String} src
 * @return {Boolean|Error} valid
 * @api public
 */

Script.prototype.invalid = function(src) {
  // try parsing 
  try {
    acorn.parse(src);
    return false;
  } catch(e) {
    return e;
  }
};

/**
 * Run the script
 *
 * @return {Script}
 * @api private
 */

Script.prototype.run = function(fn) {
  fn = fn || function() {};
  var editor = this.editor;
  var model = this.model;
  var val = model.source();
  if (!val) return fn();

  // only run if valid
  var invalid = this.invalid(val);
  if (invalid) return editor.emit('syntax error', invalid);

  // install the dependencies
  var deps = dependencies(val);
  for (var i = 0, len = deps.length; i < len; i++) {
    this.install(deps[i]);
  }

  // if we're still installing, do not run yet.
  if (this.installing.length) return fn();
  
  var runner = this.io.channel();

  // run the script
  runner.emit('run', {
    src: val,
    id: model.primary(),
    revision: model.revision()
  });

  runner.on('stdout', function(stdout) {
    editor.emit('stdout', stdout);
    return fn();
  });

  runner.on('stderr', function(stderr) {
    editor.emit('stderr', stderr);
  });

  runner.on('error', function(err) {
    editor.emit('error', err);  
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
  var install = this.io.channel();

  // install the dependency
  install.emit('install', dep);
  editor.emit('install', dep);

  // stderr
  install.on('stderr', function(stderr) {
    editor.emit('stderr', stderr);
    var i = self.installing.indexOf(dep);
    if (~i) self.installing.splice(i, 1);
  });

  // error
  install.on('error', function(err) {
    editor.emit('error', err);
    var i = self.installing.indexOf(dep);
    if (~i) self.installing.splice(i, 1);
  });

  // installed the dependency
  install.on('installed', function(stdout) {
    //if (stdout) editor.emit('stdout', stdout);
    debug('installed: %s', dep);
    var i = self.installing.indexOf(dep);
    if (~i) self.installing.splice(i, 1);
    self.installed.push(dep);
    editor.emit('installed', dep);
    self.run();
  });

  return this;
};

/**
 * Ran the script
 */

Script.prototype.ran = function() {
  console.log('ran the script');
};

/**
 * Get the value of the textarea
 */

Script.prototype.value = function(val) {
  if (val) this.cm.setValue(val);
  else return this.cm.getValue();
  return this;
};
