'use strict';
/* eslint-disable no-console */

var appServer = require('./server');

global.sinon = require('sinon');
global.chai = require('chai');
global.expect = global.chai.expect;
global.assert = global.chai.assert;
global.should = global.chai.should();
global.chai.use(require('sinon-chai'));

before(function () {
  this.sandbox = sinon.createSandbox();
});

before(function (done) {
  appServer.start(function () {
    done();
  });
});

after(function (done) {
  this.sandbox.restore();

  appServer.stop(function () {
    done();
  });
});
