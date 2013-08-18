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
var history = require('history');
var request = require('superagent');
var io = require('io');
var Script = require('./script');

/**
 * Import javascript mode
 */

require('codemirror-mode-javascript')(codemirror);

/**
 * Scripts
 */

var scripts = [];

/**
 * Export `Editor`
 */

module.exports = Editor;

/**
 * Initialize `Editor`
 */

function Editor(el) {
  if (!(this instanceof Editor)) return new Editor(el);
  this.el = document.createElement('div');
  this.el.className = 'editor';
  // this.el = document.createElement('textarea');
  // this.el.className = 'editor';
  // parent.appendChild(this.el);
  // this.editor = codemirror.fromTextArea(this.el);
  // this.onrun = debounce(this.run.bind(this), 500, false);
  // this.onsave = debounce(this.save.bind(this), 500, false);
  // this.editor.on('change', this.onrun);
  // this.editor.on('change', this.onrun);
  // this.current = false;
  // this.prev = null;
  // this.io = io.channel('runner');
}

/**
 * Mixin `Emitter`
 */

Emitter(Editor.prototype);

/**
 * Add a script
 *
 * @param {Object} script
 * @return {Editor}
 * @api public
 */

Editor.prototype.script = function(script) {
  var textarea = document.createElement('textarea');
  textarea.className = 'script';
  this.el.appendChild(textarea);
  script = new Script(textarea, script, this);

  // console.log(script);
  // console.log(this.el);
  // this.el.appendChild(script.el);
  // this.current = script;
  // var src = script.source();
  // this.value(src);
  // this.prev = src;
  return this;
};

/**
 * Run
 */

// Editor.prototype.run = function(opts) {
//   opts = opts || {};
//   var val = this.value();
//   if (!val) return this;

//   // trim
//   val = trim(val);
//   // TODO: find a better way
//   if (!opts.force && val == this.prev) return this;

//   // try parsing, otherwise emit error
//   try {
//     acorn.parse(val);
//   } catch(e) {
//     this.emit('syntax error', e);
//     return this;
//   }

//   var deps = dependencies(val);
//   for (var i = 0, len = deps.length; i < len; i++) {
//     this.current.dependency(deps[i]);
//   }

//   // run the code
//   this.io.emit('run', val);
// };

/**
 * Save the script script
 */

// Editor.prototype.save = function(e) {
//   var self = this;
//   var val = this.value();
//   if (!val || this.prev == val) return this;
//   var script = this.current;
//   var revision = script.revision();
//   script.source(val);
//   script.save(function(err) {
//     self.error(err);
//     self.prev = val;
//     var rev = script.revision();
//     if (revision != rev) {
//       history.push(script.url(rev, 'edit'));
//     }
//   });
// };

// /**
//  * Get the value of the textarea
//  */

// Editor.prototype.value = function(val) {
//   if (val) this.editor.setValue(val);
//   else return this.editor.getValue();
//   return this;
// };

/**
 * Handle errors
 *
 * @param {Error} err
 * @return {Editor}
 */

Editor.prototype.error = function(err) {
  if (!err) return;
  this.emit('error', err);
  return this;
};
