/**
 * Module Dependencies
 */

var conf = require('conf');
var ga = require('ga');

/**
 * Load analytics
 */

if (conf.ga) {
  ga(conf.ga);
}
