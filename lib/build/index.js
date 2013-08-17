
/**
 * Module dependencies.
 */

var Builder = require('component-builder');
var styl = require('styl');
var jade = require('component-jade');
var variant = require('rework-variant');
var fs = require('fs');
var read = fs.readFileSync;
var write = fs.writeFileSync;
var path = require('path');

/**
 * Component builder middleware.
 */

exports = module.exports = function(req, res, next){
  return build(next);
};

/**
 * Build
 */

var build = exports.build = function(fn) {
  var builder = new Builder('.');
  builder.addLookup('lib'); // TODO: shouldn't be necessary
  builder.copyAssetsTo('build');
  builder.use(style);
  builder.use(jade);
  builder.build(function(err, res){
    if (err) return fn(err);
    write('build/build.js', res.require + res.js);
    write('build/build.css', res.css);
    fn && fn();
  });
};

/**
 * Style plugin
 */

function style(builder) {
  builder.hook('before styles', function(pkg){
    var styles = pkg.config.styles;
    if (!styles) return;

    for (var i = 0; i < styles.length; i++) {
      var file = styles[i];
      var ext = path.extname(file);
      if ('.styl' != ext) return;


      var css = styl(read(pkg.path(file), 'utf8'), {
        whitespace: true
      }).use(variant()).toString();

      var newFile = path.basename(file, '.styl') + '.css';
      pkg.addFile('styles', newFile, css);
      pkg.removeFile('styles', file);
      --i;
    }
  });
}
