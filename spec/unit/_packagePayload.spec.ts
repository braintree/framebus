import bus = require("../../src/lib/framebus");

const messagePrefix = "/*framebus*/";

describe("_packagePayload", function () {
  it("should add event to payload", function () {
    const expected = "event name";

    const result = bus._packagePayload.call(bus, expected, [], "*");
    const actual = JSON.parse(result.replace(messagePrefix, "")).event;

    expect(actual).toBe(expected);
  });

  it("should add data to payload", function () {
    const expected = { some: "data" };
    const args = [expected];

    const result = bus._packagePayload.call(bus, "event", args, "*");
    const actual = JSON.parse(result.replace(messagePrefix, ""));

    expect(actual.args[0]).toEqual(expected);
  });

  it("should add reply to payload if data is function", function () {
    const args = [function () {}];

    const result = bus._packagePayload.call(bus, "event", args, "*");
    const actual = JSON.parse(result.replace(messagePrefix, ""));

    expect(typeof actual.replyEvent).toBe("string");
    expect(actual.args).toHaveLength(0);
  });

  it("should throw error with prefix text when element cannot be stringified", function () {
    const payload = {};

    Object.defineProperty(payload, "prop", {
      get: function () {
        throw new Error("Cross-origin denied");
      },
      enumerable: true,
    });
    const args = [payload];

    const fn = function () {
      bus._packagePayload("event", args, "*");
    };

    expect(fn).toThrowError("Could not stringify event: ");
  });
});
