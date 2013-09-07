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
var terminal = Terminal();
terminal.tail(true);
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
  if (running) return;
  classes(play).add('running');
  editor.run({ force: true });
});

/**
 * Install a module
 */

var dependencies = {};
var installing = [];

editor.on('install', function(dep) {
  terminal.writeln('installing ' + dep + '...');
});

editor.on('stdout', function(stdout) {
  console.log('stdout', stdout);
  terminal.writeln(stdout);
});

editor.on('stderr', function(stderr) {
  terminal.writeln(stderr);
});

editor.on('error', function(err) {
  terminal.writeln('editor error: ' + err);
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
