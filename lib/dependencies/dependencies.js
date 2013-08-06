/**
 * Module dependencies
 */

var rRequire = /require\s*\(['\"]([^'"]+)['"]\)/g;

/**
 * Expose `dependencies`
 */

module.exports = dependencies;

/**
 * Initialize `dependencies`
 *
 * @param {String} code
 * @return {Array} dependencies
 * @api public
 */

function dependencies(code) {
  var out = [];
  var dep;

  while (dep = rRequire.exec(code)) {
    out.push(dep[1]);
  }

  return out;
}
