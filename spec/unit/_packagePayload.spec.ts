import bus = require("../../src/lib/framebus");

const messagePrefix = "/*framebus*/";

describe("_packagePayload", function () {
  it("should add event to payload", function () {
    const expected = "event name";

    const result = bus._packagePayload.call(bus, expected, "*", {});
    const actual = JSON.parse(result.replace(messagePrefix, "")).event;

    expect(actual).toBe(expected);
  });

  it("should add data to payload", function () {
    const expected = { some: "data" };

    const result = bus._packagePayload.call(bus, "event", "*", expected);
    const actual = JSON.parse(result.replace(messagePrefix, ""));

    expect(actual.eventData).toEqual(expected);
  });

  it("should add reply to payload if provided", function () {
    const result = bus._packagePayload.call(bus, "event", "*", {}, jest.fn());
    const actual = JSON.parse(result.replace(messagePrefix, ""));

    expect(typeof actual.reply).toBe("string");
    expect(actual.eventData).toEqual({});
  });

  it("should throw error with prefix text when element cannot be stringified", function () {
    const payload = {};

    Object.defineProperty(payload, "prop", {
      get: function () {
        throw new Error("Cross-origin denied");
      },
      enumerable: true,
    });

    const fn = function (): void {
      bus._packagePayload("event", "*", payload);
    };

    expect(fn).toThrowError("Could not stringify event: ");
  });
});
