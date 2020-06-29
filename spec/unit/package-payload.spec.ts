import { packagePayload } from "../../src/lib/package-payload";

const messagePrefix = "/*framebus*/";

describe("packagePayload", function () {
  it("should add event to payload", function () {
    const expected = "event name";

    const result = packagePayload(expected, "*", {});
    const actual = JSON.parse(result.replace(messagePrefix, "")).event;

    expect(actual).toBe(expected);
  });

  it("should add data to payload", function () {
    const expected = { some: "data" };

    const result = packagePayload("event", "*", expected);
    const actual = JSON.parse(result.replace(messagePrefix, ""));

    expect(actual.eventData).toEqual(expected);
  });

  it("should add reply to payload if provided", function () {
    const result = packagePayload("event", "*", {}, jest.fn());
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
      packagePayload("event", "*", payload);
    };

    expect(fn).toThrowError("Could not stringify event: ");
  });
});
