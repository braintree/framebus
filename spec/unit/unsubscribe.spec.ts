import bus = require("../../src/lib/framebus");

describe("unsubscribe", function () {
  it("should be directly usable", function () {
    const unsubscribe = bus.unsubscribe;

    expect(function () {
      unsubscribe("event", jest.fn());
    }).not.toThrowError();
  });

  it("should remove subscriber given event and origin", function () {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();
    const s = bus._getSubscribers();

    s[origin] = {};
    s[origin][event] = [jest.fn(), fn];

    bus.target(origin).unsubscribe(event, fn);

    expect(s[origin][event]).not.toContain(fn);
    expect(s[origin][event].length).toBe(1);
  });

  it("should correctly update the array", function () {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();
    const s = bus._getSubscribers();

    s[origin] = {};
    s[origin][event] = [jest.fn(), fn];

    bus.target(origin).unsubscribe(event, fn);

    expect(s[origin][event].length).toBe(1);
  });

  it("should return true if removed", function () {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();
    const s = bus._getSubscribers();

    s[origin] = {};
    s[origin][event] = [jest.fn(), fn];

    const actual = bus.target(origin).unsubscribe(event, fn);

    expect(actual).toBe(true);
  });

  it("should return false if not removed for unknown event", function () {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();
    const s = bus._getSubscribers();

    s[origin] = {};
    s[origin][event] = [jest.fn(), fn];

    const actual = bus.target(origin).unsubscribe("another event", fn);

    expect(actual).toBe(false);
  });

  it("should return false if not removed for unknown origin", function () {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();
    const s = bus._getSubscribers();

    s[origin] = {};
    s[origin][event] = [jest.fn(), fn];

    const actual = bus.target("https://another.domain").unsubscribe(event, fn);

    expect(actual).toBe(false);
  });
});
