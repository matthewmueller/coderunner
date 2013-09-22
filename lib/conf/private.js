/**
 * Module Dependencies
 */

var c = module.exports = require('c.js')();

/**
 * Production
 */

var prod = c.env('production');

prod.client({
  ga: 'UA-10351690-11'
});
