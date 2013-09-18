/**
 * Module Dependencies
 */

var page = require('page');
var Terminal = require('terminal');
var classes = require('classes');
var event = require('event');
var Editor = require('editor');
var io = require('io');
var Script = require('script');
var history = require('history');

/**
 * Initialize yields/k
 */

var k = require('k')(window);
k.ignore = false; // do not ignore textareas

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

var playButton = document.querySelector('.play');
event.bind(playButton, 'click', play);
k('command + enter', play);
k('shift + enter', play);

function play(e) {
  e.preventDefault();
  var cls = classes(playButton);
  if(cls.has('running')) return;
  cls.add('running');
  editor.run(function() {
    cls.remove('running');
  });
}

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
  terminal.error(err);
});

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

/**
 * Introduction
 */

terminal.log('Welcome to coderunner!');

/**
 * Start page
 */

page({ click: false });

