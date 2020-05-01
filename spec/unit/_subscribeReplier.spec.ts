import bus = require("../../src/lib/framebus");

describe("_subscribeReplier", function () {
  it("should return UUID of reply event", function () {
    const actual = bus._subscribeReplier(function () {}, "*");

    expect(actual).toMatch(/^\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}$/);
  });

  it("should subscribe function to returned event", function () {
    const origin = "http://example.com";
    const event = bus._subscribeReplier(function () {}, origin);

    expect(bus._getSubscribers()[origin][event][0]).toBeInstanceOf(Function);
  });

  it("should unsubscribe function when reply invoked", function () {
    const origin = "http://example.com";
    const event = bus._subscribeReplier(function () {}, origin);

    expect(bus._getSubscribers()[origin][event][0]).toBeInstanceOf(Function);

    bus._getSubscribers()[origin][event][0]();

    expect(bus._getSubscribers()[origin][event][0]).not.toBeDefined();
  });
});
