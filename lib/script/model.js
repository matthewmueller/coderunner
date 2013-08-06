/**
 * Module Dependencies
 */

var model = require('modella');
var timestamps = require('model-timestamps');
var isBrowser = require('is-browser');

/**
 * Expose `Script`
 */

var Script = module.exports = model('script')
  .attr('id')
  .attr('sources', { defaultValue: ['', ''] });

/**
 * Add timestamps
 */

Script.use(timestamps);

/**
 * Add a source
 *
 * @param {String} src
 * @return {Script}
 * @api private
 */

Script.prototype.source = function(src, revision) {
  revision = revision || this.revision() || 1;
  var sources = this.sources();

  // getter
  if (!src) return sources[revision];

  // setter
  sources[revision] = src;
  this.sources(sources);

  return this;
};

/**
 * Fetch the url
 */

Script.prototype.url = function(revision, str) {
  var sources = this.sources();
  var revision = revision || 1;

  var url = '/' + this.primary() + '/' + revision;
  if (str) url += '/' + str;
  return url;
};

/**
 * Add the sync layer
 */

if (isBrowser) {
  Script.attr('revision', { defaultValue: 1 });
  var ajax = require('modella-ajax');
  Script.use(ajax('/script'));
} else {
  var home = process.env.HOME;
  var level = require('modella-leveldb')(home + '/data/scripts');
  var fs = require('fs');
  Script.use(level);

  Script.on('save', function(script) {
    console.log('saving!');
  });
}
