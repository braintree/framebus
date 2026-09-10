import { subscribers, subscribeReplier } from "../../src/lib";

describe("subscribeReplier", () => {
  it("should return UUID of reply event", () => {
    const actual = subscribeReplier(jest.fn(), "*");

    expect(actual).toMatch(/^\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}$/);
  });

  it("should subscribe function to returned event", () => {
    const origin = "http://example.com";
    const event = subscribeReplier(jest.fn(), origin);

    expect(subscribers[origin][event][0]).toBeInstanceOf(Function);
  });

  it("should unsubscribe function when reply invoked", () => {
    const origin = "http://example.com";
    const event = subscribeReplier(jest.fn(), origin);

    expect(subscribers[origin][event][0]).toBeInstanceOf(Function);

    subscribers[origin][event][0]();

    expect(subscribers[origin][event][0]).not.toBeDefined();
  });

  it("does not invoke the reply handler when verifyDomain rejects the sender", () => {
    const fn = jest.fn();
    const origin = "*";
    const verifyDomain = (domain: string): boolean =>
      domain === "https://trusted.example.com";
    const event = subscribeReplier(fn, origin, verifyDomain);

    // simulate a dispatch from an untrusted origin
    subscribers[origin][event][0].apply(
      { origin: "https://evil.example.com" },
      [{}],
    );

    expect(fn).not.toHaveBeenCalled();
    // the listener remains so the legitimate reply can still arrive
    expect(subscribers[origin][event][0]).toBeInstanceOf(Function);
  });
});
