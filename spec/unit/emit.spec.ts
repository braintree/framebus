import Framebus = require("../../src/");

describe("emit", () => {
  let bus: Framebus;

  beforeEach(() => {
    bus = new Framebus();
  });

  it("should return false if event is not a string", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actual = bus.emit({} as any, { data: "data" });

    expect(actual).toBe(false);
  });

  it("should return false if origin is not a string", () => {
    const actual = bus
      .target({
        origin: {
          foo: "object",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .emit("event", { data: "data" });

    expect(actual).toBe(false);
  });

  it("should return true if origin and event are strings", () => {
    const actual = bus
      .target({
        origin: "https://example.com",
      })
      .emit("event", { data: "data" });

    expect(actual).toBe(true);
  });

  it("can pass a reply function without passing data", () => {
    const actual = bus
      .target({
        origin: "https://example.com",
      })
      .emit("event", jest.fn());

    expect(actual).toBe(true);
  });
});
