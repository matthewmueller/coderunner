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

editor.on('dependency', function(name) {
  if (!connected) return;

  var dep = dependencies[name];
  if (dep) return dep;
  dep = dependencies[name] = io.channel(name);
  installing.push(name);

  dep.on('stdout', function(str) {
    terminal.writeln(trim(str));
  });

  dep.on('stderr', function(str) {
    terminal.writeln(trim(str));
    delete dependencies[name]; // try again
  });

  dep.on('installed', function() {
    terminal.writeln(name + ' successfully installed');
    var i = installing.indexOf(name);
    if (~i) installing.splice(i, 1);
  });

  dep.emit('install', name);
});

/**
 * Handle editor errors
 */

editor.on('error', function(err) {
  terminal.writeln('editor error: ' + err);
});

/**
 * Listen for some "quode"
 */

var running = false;
var showInstallMessage = true;
var runner = io.channel('runner');

runner.on('stdout', function(str) {
  terminal.writeln(trim(str));
});

runner.on('stderr', function(str) {
  terminal.writeln(trim(str));
  running = false;
});

runner.on('ran', function() {
  classes(play).remove('running');
  running = false;
});

/**
 * When editor says to run code, emit "run"
 */

editor.on('run', function(code) {
  if (!connected || running) return;

  if (installing.length && showInstallMessage) {
    terminal.writeln('installing: ' + installing.join(', '));
    showInstallMessage = false;
  } else if (!installing.length) {
    running = true;
    runner.emit('run', code);
  }
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
  script.revision(revision);
  editor.script(script);

  // connect to io-server
  var slug = script.slug(revision);
  io.connect(origin + '/' + slug);
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
