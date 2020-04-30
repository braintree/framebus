'use strict';

global.mkWindow = function () {
  return {
    top: {
      postMessage: function () {},
      frames: []
    },
    onmessage: null
  };
};

global.mkFrame = function () {
  return {
    postMessage: jest.fn(),
    frames: []
  };
};

global.window = mkWindow();

global.messagePrefix = '/*framebus*/';
global.bus = require('../../lib/framebus');

beforeEach(function () {
  global.scope = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };
});

afterEach(function () {
  global.bus._detach();
});
