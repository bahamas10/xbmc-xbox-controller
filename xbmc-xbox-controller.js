#!/usr/bin/env node
/*
 * xbmc-xbox-controller
 *
 * Control XBMC using an original Xbox controller
 *
 * Authors: Dave Eddy <dave@daveeddy.com>
 * Date: 12/2/13
 * License: MIT License
 */

var fs = require('fs');
var path = require('path');
var util = require('util');

var getopt = require('posix-getopt');
var xec = require('xbmc-event-client');
var xhc = require('xbox-hid-controller');

var package = require('./package.json');
var appname = util.format('%s@%s', package.name, package.version);

function usage() {
  return [
    'usage: xbmc-xbox-controller [HID path]',
    '',
    'control XBMC using an original Xbox controller',
    '',
    '  -d, --deadzone <percent>      [env XBOX_XBMC_DEADZONE] deadzone for analog sticks, defaults to ' + opts.deadzone,
    '  -h, --help                    print this message and exit',
    '  -H, --host <host>             [env XBOX_XBMC_HOST] host on which to listen, defaults to ' + xec.DEFAULT_HOST,
    '  -l, --list                    list all HID devices found and exit',
    '  -p, --port <port>             [env XBOX_XBMC_PORT] port on which to listen, defaults to ' + xec.DEFAULT_PORT,
    '  -u, --updates                 check for available updates',
    '  -v, --verbose                 increase verbosity',
    '  -V, --version                 print the version number and exit'
  ].join('\n');
}

function debug() {
  if (opts.verbosity >= 1)
    return console.log.apply(console, arguments);
}
function trace() {
  if (opts.verbosity >= 2)
    return console.log.apply(console, arguments);
}

// command line arguments
var options = [
  'd:(deadzone)',
  'h(help)',
  'H:(host)',
  'l(list)',
  'p:(port)',
  'u(updates)',
  'v(verbose)',
  'V(version)'
].join('');
var parser = new getopt.BasicParser(options, process.argv);

var opts = {
  host: process.env.XBOX_XBMC_HOST,
  port: process.env.XBOX_XBMC_PORT,
  deadzone: process.env.XBOX_XBMC_DEADZONE || 30,
  verbosity: 0
};
var option;
while ((option = parser.getopt()) !== undefined) {
  switch (option.option) {
    case 'd': opts.deadzone = option.optarg; break;
    case 'h': console.log(usage()); process.exit(0);
    case 'H': opts.host = option.optarg; break;
    case 'l': // list all HID devices
      xhc.listAll().forEach(function(dev) {
        if (dev.path)
          console.log('%s: %s', dev.path, dev.product);
      });
      process.exit(0);
    case 'p': opts.port = option.optarg; break;
    case 'u': // check for updates
      require('latest').checkupdate(package, function(ret, msg) {
        console.log(msg);
        process.exit(ret);
      });
      return;
    case 'v': opts.verbosity++; break;
    case 'V': console.log(package.version); process.exit(0);
    default: console.error(usage()); process.exit(1); break;
  }
}
var args = process.argv.slice(parser.optind());

var devicepath = args[0];

if (!devicepath) {
  var controllers = xhc.listControllers();
  if (!controllers.length) {
    console.error('no controllers found');
    process.exit(1);
  } else if (controllers.length === 1) {
    devicepath = controllers[0].path;
    console.log('one controller found');
  } else {
    console.log('multiple controllers found, rerun script with device path as the first argument');
    console.log();
    console.log(controllers.map(function(controller) { return controller.path; }).join('\n'));
    process.exit(2);
  }
}

var xbmcopts = {
  host: opts.host,
  port: opts.port,
  iconbuffer: fs.readFileSync(path.join(__dirname, 'icon.jpg')),
  icontype: xec.ICON_JPEG
};

console.log('opening device: %s', devicepath);

var controller = new xhc.XboxController(devicepath);
var xbmc = new xec.XBMCEventClient(appname, xbmcopts);

// send HELO to XBMC
xbmc.connect(function(errors, bytes) {
  if (errors.length)
    throw errors[0];

  console.log('connected to XBMC, ctrl-c to quit');

  var cache = {};
  var callsmade = 0;
  // controller state changed
  controller.on('values', function(values) {
    Object.keys(values).forEach(function(key) {
      var oldval = cache[key];
      var newval = values[key];

      // check dead zone for analog sticks
      switch (key) {
        case 'rasX': case 'rasY': case 'lasX': case 'lasY':
          if ((Math.abs(newval) * 2 / 65536) < (opts.deadzone / 100))
            newval = 0;
          break;
      }

      // if they are the same, nothing has been pressed, just return
      if (oldval === newval)
        return;

      // this gets added to every buttonState() call if not added explicitly
      var template = {
        map: 'XG',
        down: !!newval
      }
      var tosend = [];
      switch (key) {
        case 'a': tosend.push({button: 'A'}); break;
        case 'b': tosend.push({button: 'B'}); break;
        case 'x': tosend.push({button: 'X'}); break;
        case 'y': tosend.push({button: 'Y'}); break;

        case 'up': tosend.push(   {button: 'dpadup'}); break;
        case 'down': tosend.push( {button: 'dpaddown'}); break;
        case 'left': tosend.push( {button: 'dpadleft'}); break;
        case 'right': tosend.push({button: 'dpadright'}); break;

        case 'white': tosend.push({button: 'white'}); break;
        case 'black': tosend.push({button: 'black'}); break;

        case 'start': tosend.push({button: 'start'}); break;
        case 'back': tosend.push( {button: 'back'}); break;

        case 'las': tosend.push({button: 'leftthumbbutton'}); break;
        case 'ras': tosend.push({button: 'rightthumbbutton'}); break;

        case 'rtrigger': tosend.push({button: 'rightanalogtrigger', amount: newval * 256}); break;
        case 'ltrigger': tosend.push({button: 'leftanalogtrigger',  amount: newval * 256}); break;

        case 'rasX':
          tosend.push({button: newval > 0 ? 'rightthumbstickright' : 'rightthumbstickleft',  amount: Math.abs(newval) * 2, axis: 1});
          tosend.push({button: newval > 0 ? 'rightthumbstickleft'  : 'rightthumbstickright', amount: 0, down: 0, axis: 1});
          break;
        case 'rasY':
          tosend.push({button: newval > 0 ? 'rightthumbstickdown' : 'rightthumbstickup',   amount: Math.abs(newval) * 2, axis: 1});
          tosend.push({button: newval > 0 ? 'rightthumbstickup'   : 'rightthumbstickdown', amount: 0, down: 0, axis: 1});
          break;
        case 'lasX':
          tosend.push({button: newval > 0 ? 'leftthumbstickright' : 'leftthumbstickleft',  amount: Math.abs(newval) * 2, axis: 1});
          tosend.push({button: newval > 0 ? 'leftthumbstickleft'  : 'leftthumbstickright', amount: 0, down: 0, axis: 1});
          break;
        case 'lasY':
          tosend.push({button: newval > 0 ? 'leftthumbstickdown' : 'leftthumbstickup',   amount: Math.abs(newval) * 2, axis: 1});
          tosend.push({button: newval > 0 ? 'leftthumbstickup'   : 'leftthumbstickdown', amount: 0, down: 0, axis: 1});
          break;
      }

      // make each buttonState() call
      tosend.forEach(function(state) {
        for (var i in template)
          if (typeof state[i] === 'undefined')
            state[i] = template[i];

        if (state.amount)
          state.amount = Math.min(65535, Math.max(0, state.amount));

        trace(JSON.stringify(state));
        xbmc.buttonState(state);
        callsmade++;
      });

      cache[key] = newval;
    });
  });

  controller.on('error', function(err) {
    debug('error: %s', err.message);
  });

  // ping every 55 seconds to stay active
  setInterval(xbmc.ping.bind(xbmc), 55 * 1000);

  // dump statistics every second
  setInterval(function() {
    if (!callsmade)
      return;
    debug('%d updates sent in the last second', callsmade);
    callsmade = 0;
  }, 1000);
});
