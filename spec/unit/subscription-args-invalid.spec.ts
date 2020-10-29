import { subscriptionArgsInvalid } from "../../src/lib/subscription-args-invalid";

describe("subscriptionArgsInvalid", () => {
  it("should return false for valid types", () => {
    const actual = subscriptionArgsInvalid("event", jest.fn(), "*");

    expect(actual).toBe(false);
  });

  it("should return true if event is not string", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actual = subscriptionArgsInvalid({} as any, jest.fn(), "*");

    expect(actual).toBe(true);
  });

  it("should return true if fn is not function", () => {
    const actual = subscriptionArgsInvalid(
      "event",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "function" as any,
      "*"
    );

    expect(actual).toBe(true);
  });

  it("should return true if origin is not string", () => {
    const actual = subscriptionArgsInvalid("event", jest.fn(), {
      event: "object",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(actual).toBe(true);
  });
});
