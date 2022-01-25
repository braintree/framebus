import { subscribers } from "../../src/lib/constants";
import { Framebus } from "../../src/";

describe("off", () => {
  it("should remove subscriber given event and origin", () => {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();

    subscribers[origin] = {};
    subscribers[origin][event] = [jest.fn(), fn];

    Framebus.target({
      origin,
    }).off(event, fn);

    expect(subscribers[origin][event]).not.toContain(fn);
    expect(subscribers[origin][event].length).toBe(1);
  });

  it("should correctly update the array", () => {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();

    subscribers[origin] = {};
    subscribers[origin][event] = [jest.fn(), fn];

    Framebus.target({
      origin,
    }).off(event, fn);

    expect(subscribers[origin][event].length).toBe(1);
  });

  it("should return true if removed", () => {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();

    subscribers[origin] = {};
    subscribers[origin][event] = [jest.fn(), fn];

    const actual = Framebus.target({
      origin,
    }).off(event, fn);

    expect(actual).toBe(true);
  });

  it("should return false if not removed for unknown event", () => {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();

    subscribers[origin] = {};
    subscribers[origin][event] = [jest.fn(), fn];

    const actual = Framebus.target({
      origin,
    }).off("another event", fn);

    expect(actual).toBe(false);
  });

  it("should return false if not removed for unknown origin", () => {
    const event = "the event";
    const origin = "https://example.com";
    const fn = jest.fn();

    subscribers[origin] = {};
    subscribers[origin][event] = [jest.fn(), fn];

    const actual = Framebus.target({
      origin: "https://another.domain",
    }).off(event, fn);

    expect(actual).toBe(false);
  });
});
