"use strict";

import bus = require("../../src/lib/framebus");

describe("_attach", function () {
  let addEventSpy: jest.SpyInstance;

  beforeEach(function () {
    bus._detach();
    addEventSpy = jest.spyOn(window, "addEventListener").mockImplementation();
  });

  it("should add listener to scope", function () {
    bus._attach();

    expect(addEventSpy).toBeCalledWith("message", bus._onmessage, false);
  });

  it("should only add listener to scope once", function () {
    bus._attach();
    bus._attach();

    expect(addEventSpy).toBeCalledTimes(1);
  });
});
