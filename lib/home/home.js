/**
 * Module Dependencies
 */

var IO = require('io');
var request = require('superagent');
var page = require('page');
var Terminal = require('terminal');
var classes = require('classes');
var event = require('event');
var Editor = require('editor');
var io = require('io');
var trim = require('trim');
var Container = require('container');
var Script = require('script');
var history = require('history');

/**
 * Global automon element
 */

var automon = window.automon;
var connected = false;

/**
 * Elements
 */

var main = document.getElementById('main');

/**
 * Setup terminal
 */

var terminalEl = document.getElementById('terminal');
var terminal = new Terminal();
terminalEl.appendChild(terminal.el);

/**
 * Initialize Editor
 */

var editor = new Editor();
main.appendChild(editor.el);

/**
 * Press the play button
 */

var play = document.querySelector('.play');
event.bind(play, 'click', function() {
  var cls = classes(play);
  if(cls.has('running')) return;
  cls.add('running');
  editor.run(function() {
    cls.remove('running');
  });
});

/**
 * Install a module
 */

var dependencies = {};
var installing = [];

editor.on('install', function(dep) {
  var line = terminal.log('installing %s...', dep);

  var sid = setInterval(function() {
    line.append('.');
  }, 1000);

  editor.on('installed', function installed(d) {
    if (dep != d) return;
    line.append(' done');
    clearInterval(sid);
    editor.off('installed', installed);
  });
});

editor.on('stdout', function(stdout) {
  terminal.log(stdout);
});

editor.on('stderr', function(stderr) {
  terminal.error(stderr);
});

editor.on('error', function(err) {
  terminal.error(stderr);
});

/**
 * Create a new container
 */

// var container = new Container();

// container.start(function(err) {
//   if (err) {
//     console.error(err);
//     return terminal.writeln('could not start container! try refreshing...');
//   }

//   // Connect
//   var origin = window.location.origin;
//   var port = container.port;
//   var host = origin.replace(/:?\d{4,5}$/, '') + ':' + port;

//   io.connect(host);

//   // On open
//   io.socket.on('open', function() {
//     terminal.writeln('connected!');
//     connected = true;
//     editor.run({ force: true });
//   });
// });

/**
 * Kill the container on reload
 */

// window.onbeforeunload = function() {
//   var id = window.location.pathname.replace('/', '');
//   container.kill();
// };

/**
 * Routing
 */

var origin = window.location.origin;

page('/:id/:revision/edit?', function(ctx) {
  var params = ctx.params;
  var id = params.id;
  var revision = +params.revision;
  var script = new Script(window.script);
  var slug = script.slug(revision);
  script.revision(revision);

  // connect to io-server
  io.connect(origin + '/' + slug);

  // add the script to the editor
  editor.script(script);
});

page('/:id', function(ctx) {
  throw new Error('not supported yet');
  // editor.script(window.script);
});

page('/', function() {
  var script = new Script();
  editor.script(script);

  // Save the script
  script.save(function(err) {
    if (err) throw err;
    history.push(script.url(1, 'edit'));

    // Connect to IO server
    var slug = script.slug(1);
    io.connect(origin + '/' + slug);
  });
});

// initialize
page({ click: false });
