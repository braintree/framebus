import bus = require("../../src/lib/framebus");

describe("publish", function () {
  beforeEach(function () {
    bus._attach();
  });

  it("should be directly usable", function () {
    const publish = bus.publish;

    expect(function () {
      publish("event", "data");
    }).not.toThrowError();
  });

  it("should return false if event is not a string", function () {
    const actual = bus.publish({}, "");

    expect(actual).toBe(false);
  });

  it("should return false if origin is not a string", function () {
    const actual = bus.target({ origin: "object" }).publish("event", "");

    expect(actual).toBe(false);
  });

  it("should return true if origin and event are strings", function () {
    const actual = bus.target("https://example.com").publish("event", "");

    expect(actual).toBe(true);
  });
});
