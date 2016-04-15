'use strict';
/* eslint-disable no-console */

var seleniumServer;
var appServer = require('./server');

global.sinon = require('sinon');
global.chai = require('chai');
global.expect = global.chai.expect;
global.assert = global.chai.assert;
global.should = global.chai.should();
global.chai.use(require('sinon-chai'));

before(function () {
  this.sandbox = sinon.sandbox.create();
});

before(function (done) {
  var selenium = require('selenium-standalone');
  var spawnOptions = {stdio: 'pipe'};
  var seleniumArgs = ['-debug'];

  this.timeout(30000);

  seleniumServer = selenium(spawnOptions, seleniumArgs);

  console.log('Waiting for selenium to start...');
  seleniumServer.stderr.on('data', function (data) {
    if (data.toString().indexOf('Started org.openqa.jetty.jetty.Server') !== -1) {
      console.log('Selenium started!');
      done();
    }
  });
});

before(function (done) {
  appServer.start(function () {
    done();
  });
});

after(function () {
  this.sandbox.restore();
});

after(function () {
  seleniumServer.kill('SIGKILL');
});

after(function (done) {
  appServer.stop(function () {
    done();
  });
});
