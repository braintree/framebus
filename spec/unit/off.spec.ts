import { subscribers } from "../../src/lib/constants";
import bus = require("../../src/");

describe("off", function () {
  it("should remove subscriber given event and origin", function () {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();

    subscribers[origin] = {};
    subscribers[origin][event] = [jest.fn(), fn];

    bus.target(origin).off(event, fn);

    expect(subscribers[origin][event]).not.toContain(fn);
    expect(subscribers[origin][event].length).toBe(1);
  });

  it("should correctly update the array", function () {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();

    subscribers[origin] = {};
    subscribers[origin][event] = [jest.fn(), fn];

    bus.target(origin).off(event, fn);

    expect(subscribers[origin][event].length).toBe(1);
  });

  it("should return true if removed", function () {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();

    subscribers[origin] = {};
    subscribers[origin][event] = [jest.fn(), fn];

    const actual = bus.target(origin).off(event, fn);

    expect(actual).toBe(true);
  });

  it("should return false if not removed for unknown event", function () {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();

    subscribers[origin] = {};
    subscribers[origin][event] = [jest.fn(), fn];

    const actual = bus.target(origin).off("another event", fn);

    expect(actual).toBe(false);
  });

  it("should return false if not removed for unknown origin", function () {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();

    subscribers[origin] = {};
    subscribers[origin][event] = [jest.fn(), fn];

    const actual = bus.target("https://another.domain").off(event, fn);

    expect(actual).toBe(false);
  });
});
