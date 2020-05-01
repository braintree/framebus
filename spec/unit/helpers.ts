import bus = require("../../src/lib/framebus");

afterEach(function () {
  jest.restoreAllMocks();
  bus._detach();
});
