/**
 * Module dependencies
 */

var domify = require('domify');
var classes = require('classes');
var printf = require('format');

/**
 * Templates
 */

var terminal = '<div class="terminal"></div>';
var line = '<div class="terminal-line"></div>';

/**
 * Expose `Terminal`
 */

module.exports = Terminal;

/**
 * Initialize `Terminal`
 *
 * @return {Terminal}
 * @api public
 */

function Terminal() {
  if (!(this instanceof Terminal)) return new Terminal;
  this.el = domify(terminal);
}

/**
 * Log to the terminal
 *
 * @return {Line}
 * @api public
 */

Terminal.prototype.log = function() {
  var str = print(arguments);
  var line = new Line(str, 'log');
  this.el.appendChild(line.el);
  this.bottom();
  return line;
};

/**
 * Log an error to the terminal
 *
 * @return {Line}
 * @api public
 */

Terminal.prototype.error = function() {
  var str = print(arguments);
  var line = new Line(str, 'error');
  this.el.appendChild(line.el);
  this.bottom();
  return line;
};

/**
 * Make sure we're at the bottom
 */

Terminal.prototype.bottom = function() {
  var el = this.el;
  el.scrollTop = el.scrollHeight;
}

/**
 * Initialize a `Line`
 *
 * @param {String} str
 * @param {String} level
 * @return {Line}
 * @api public
 */

function Line(str, level) {
  if (!(this instanceof Line)) return new Line(str);
  this.el = domify(line);
  this.el.textContent = str;
  this.classes = classes(this.el);

  // handle different levels
  if ('error' == level) this.classes.add('error');
}

/**
 * Append to the string
 *
 * @return {Line}
 * @api public
 */

Line.prototype.append = function() {
  var str = print(arguments);
  this.el.textContent = this.el.textContent + str;
  return this;
}

/**
 * Use console.log to print to terminal
 */

function print(args) {
  return printf.apply(null, args);
};
