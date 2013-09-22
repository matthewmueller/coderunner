/**
 * Module Dependencies
 */

var c = module.exports = require('c.js')();

/**
 * Production
 */

var prod = c.env('production');

prod.client({
  ga: 'some ga'
});
