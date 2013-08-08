/**
 * Module Dependencies
 */

var extend = require('extend.js');
var base = require('./base.js');

/**
 * Application environment
 */

var env = (undefined !== process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';

/**
 * Configurations
 */

var config = {
  production: extend(base, require('./production.js')),
  development: extend(base, require('./development.js'))
};

/**
 * Get from config
 */

module.exports = function(key) {
  if (!config[env]) return null;
  return config[env][key] || null;
};
