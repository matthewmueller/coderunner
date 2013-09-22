/**
 * Module Dependencies
 */

var conf = require('conf');
var ga = require('ga');

/**
 * Load analytics
 */

console.log(conf.ga);
if (conf.ga) {
  ga(conf.ga);
}
