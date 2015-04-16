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

global.mkFrame = function (scope) {
  return {
    postMessage: scope.sandbox.spy(),
    frames: []
  };
};

global.window = mkWindow();
