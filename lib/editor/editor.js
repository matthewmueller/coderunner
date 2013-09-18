/**
 * Module dependencies
 */

var Emitter = require('emitter');
var Script = require('./script');

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

function Editor() {
  if (!(this instanceof Editor)) return new Editor();
  this.el = document.createElement('div');
  this.el.className = 'editor';
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

  // set as the current
  this.current = script;

  // try running immediately
  script.run();

  return this;
};

/**
 * Run
 *
 * @param {Function} fn
 * @return {Editor}
 */

Editor.prototype.run = function(fn) {
  if (this.current) this.current.run(fn);
  return this;
};
