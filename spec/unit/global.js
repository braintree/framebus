'use strict';

var chai = require('chai');
chai.use(require('sinon-chai'));

global.sinon = require('sinon');
global.expect = chai.expect;
global.messagePrefix = '/*framebus*/'

before(function () {
  this.sandbox = sinon.sandbox.create();
  this.bus = require('../../lib/framebus');
});

beforeEach(function () {
  this.scope = {
    addEventListener:    this.sandbox.spy(),
    removeEventListener: this.sandbox.spy()
  };
});

afterEach(function () {
  this.bus._detach();
});

after(function () {
  this.sandbox.restore();
});
