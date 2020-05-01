import bus = require("../../src/lib/framebus");

describe("subscribe", function () {
  it("should be directly usable", function () {
    const subscribe = bus.subscribe;

    expect(function () {
      subscribe("event", jest.fn());
    }).not.toThrowError();
  });

  it("should add subscriber to given event and origin", function () {
    const event = "event name";
    const origin = "https://example.com";
    const fn = jest.fn();

    bus.target(origin).subscribe(event, fn);

    expect(bus._getSubscribers()[origin][event]).toEqual(
      expect.arrayContaining([fn])
    );
  });

  it("should add subscriber to given event and * origin if origin not given", function () {
    const event = "event name";
    const fn = jest.fn();

    bus.subscribe(event, fn);

    expect(bus._getSubscribers()["*"][event]).toEqual(
      expect.arrayContaining([fn])
    );
  });
});
