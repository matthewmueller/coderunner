/**
 * Module Dependencies
 */

var model = require('modella');
var timestamps = require('model-timestamps');
var isBrowser = require('is-browser');
var conf = require('conf');

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
  if (this.revision) {
    revision = revision || this.revision();
  } else {
    revision = revision || 1;
  }

  var sources = this.sources();

  // getter
  if (undefined == src) return sources[revision];

  // setter
  sources[revision] = src;
  this.sources(sources);

  return this;
};

/**
 * Fetch the url
 */

Script.prototype.url = function(revision, str) {
  revision = revision || 1;
  var url = '/' + this.primary() + '/' + revision;
  if (str) url += '/' + str;
  return url;
};

/**
 * Fetch the slug
 *
 * @param {Number} revision
 * @return {String}
 */

Script.prototype.slug = function(revision) {
  revision = revision || 1;
  var slug = this.primary() + '/' + revision;
  return slug;
};

/**
 * TODO: improve
 */

if (isBrowser) {
  Script.attr('dependencies', { defaultValue: [] });
  Script.attr('installs', { defaultValue: [] });

  Script.prototype.dependency = function(dep) {
    var deps = this.dependencies();
    var installs = this.installs();
    if (~deps.indexOf(dep)) return this;
    deps.push(dep);
    this.dependencies(deps);
    installs.push(dep);
    this.installs(installs);
    return this;
  };

  Script.prototype.installed = function(dep) {
    var installs = this.installs();
    var i = installs.indexOf(dep);
    if (!~i) return this;
    installs.splice(i, 1);
    this.installs(installs);
  };

  Script.prototype.ready = function() {
    if (!this.installs().length) return true;
    return false;
  };
}

/**
 * Add the sync layer
 */

if (isBrowser) {
  Script.attr('revision', { defaultValue: 1 });
  var ajax = require('modella-ajax');
  Script.use(ajax('/script'));
} else {
  var path = require('path');
  var join = path.join;
  var dbdir = conf['db path'];
  var level = require('modella-leveldb')(join(dbdir, 'scripts'));
  var fs = require('fs');
  Script.use(level);
}
