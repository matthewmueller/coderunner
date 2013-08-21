/**
 * Module dependencies
 */


/**
 * Expose `install`
 */

module.exports = Install;

/**
 * Install a dependency
 */

function Install(dep, io) {
  if (!(this instanceof Install)) return new Install(dep, this);
  this.io = io;
  this.install(dep);
}

/**
 * Install the dependency
 */

Install.prototype.install = function(dep) {
  console.log('installing dependency: %s', dep);
};
