import bus = require("../../src/lib/framebus");

describe("_subscriptionArgsInvalid", function () {
  let args: any[];

  beforeEach(function () {
    args = ["event", jest.fn(), "*"];
  });

  it("should return false for valid types", function () {
    const actual = bus._subscriptionArgsInvalid(...args);

    expect(actual).toBe(false);
  });

  it("should return true if event is not string", function () {
    args[0] = {};
    const actual = bus._subscriptionArgsInvalid(...args);

    expect(actual).toBe(true);
  });

  it("should return true if fn is not function", function () {
    args[1] = "function";
    const actual = bus._subscriptionArgsInvalid(...args);

    expect(actual).toBe(true);
  });

  it("should return true if origin is not string", function () {
    args[2] = { event: "object" };
    const actual = bus._subscriptionArgsInvalid(...args);

    expect(actual).toBe(true);
  });
});
