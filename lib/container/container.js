/**
 * Module dependencies
 */

var superagent = require('superagent');

/**
 * Export `Container`
 */

module.exports = Container;

/**
 * Initialize `Container`
 */

function Container() {
  if (!(this instanceof Container)) return new Container();
}

/**
 * Start the `Container`
 *
 * @param {Function} fn
 * @return {Container}
 */

Container.prototype.start = function(fn) {
  var self = this;
  superagent.post('/containers')
    .end(function(res) {
      if (!res.ok) fn(res.text);
      var body = res.body;
      self.id = body.id;
      self.port = body.port;

      // give it a second to set everything up
      setTimeout(function() {
        fn(null, body);
      }, 500);
    });
};

/**
 * Kill the container
 */

Container.prototype.kill = function() {
  // Use image, it's faster and we just need to signal
  var i = new Image(1, 1);
  i.src = '/containers/' + this.id + '/kill';
};
