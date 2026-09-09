import { packagePayload, subscribers } from "../../src/lib";

const messagePrefix = "/*framebus*/";

describe("packagePayload", () => {
  it("should add event to payload", () => {
    const expected = "event name";

    const result = packagePayload(expected, "*", {});
    const actual = JSON.parse(result.replace(messagePrefix, "")).event;

    expect(actual).toBe(expected);
  });

  it("should add data to payload", () => {
    const expected = { some: "data" };

    const result = packagePayload("event", "*", expected);
    const actual = JSON.parse(result.replace(messagePrefix, ""));

    expect(actual.eventData).toEqual(expected);
  });

  it("should add reply to payload if provided", () => {
    const result = packagePayload("event", "*", {}, jest.fn());
    const actual = JSON.parse(result.replace(messagePrefix, ""));

    expect(typeof actual.reply).toBe("string");
    expect(actual.eventData).toEqual({});
  });

  it("threads verifyDomain through to the reply listener", () => {
    const fn = jest.fn();
    const verifyDomain = (domain: string): boolean =>
      domain === "https://trusted.example.com";
    const result = packagePayload("event", "*", {}, fn, verifyDomain);
    const replyEvent = JSON.parse(result.replace(messagePrefix, "")).reply;

    // a forged reply from an untrusted origin is ignored
    subscribers["*"][replyEvent][0].apply(
      { origin: "https://evil.example.com" },
      [{}],
    );
    expect(fn).not.toHaveBeenCalled();

    // the legitimate reply from a trusted origin is delivered
    subscribers["*"][replyEvent][0].apply(
      { origin: "https://trusted.example.com" },
      [{}],
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should throw error with prefix text when element cannot be stringified", () => {
    const payload = {};

    Object.defineProperty(payload, "prop", {
      get() {
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
