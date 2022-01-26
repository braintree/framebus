import { FramebusConfig } from "../../../src/framebus-config";
import { emit, teardown } from "../../../src/methods";
import { broadcast } from "../../../src/lib/broadcast";

jest.mock("../../../src/lib/broadcast");

describe("emit", () => {
  let config: FramebusConfig;

  beforeEach(() => {
    config = new FramebusConfig();
  });

  it("should return false if event is not a string", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actual = emit(config, {} as any, { data: "data" });

    expect(actual).toBe(false);
  });

  it("should return false if origin is not a string", () => {
    const actual = emit(
      new FramebusConfig({
        origin: {
          foo: "object",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      }),
      "event",
      { data: "data" }
    );

    expect(actual).toBe(false);
  });

  it("should return true if origin and event are strings", () => {
    const actual = emit(
      new FramebusConfig({
        origin: "https://example.com",
      }),
      "event",
      { data: "data" }
    );

    expect(actual).toBe(true);
  });

  it("can pass a reply function without passing data", () => {
    const actual = emit(config, "event", jest.fn());

    expect(actual).toBe(true);
  });

  it("returns true when subscriber is added", () => {
    expect(emit(config, "event-name")).toBe(true);
    expect(emit(config, "event-name", { foo: "bar" })).toBe(true);
    expect(emit(config, "event-name", { foo: "bar" }, jest.fn())).toBe(true);
    expect(emit(config, "event-name", jest.fn())).toBe(true);
  });

  it("returns false when subscriber is not added", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(emit(config, { notAString: 12 })).toBe(false);
  });

  it("broadcasts", () => {
    const data = { foo: "bar" };
    emit(config, "event-name", data, () => {
      // noop
    });

    expect(broadcast).toBeCalledTimes(1);
    expect(broadcast).toBeCalledWith(
      window.top,
      expect.stringContaining('"foo":"bar"'),
      "*"
    );
  });

  it("does not broadcast if torn down", () => {
    teardown(config);

    expect(emit(config, "event-name")).toBe(false);
    expect(broadcast).toBeCalledTimes(0);
  });

  it("broadcasts to specified origin", () => {
    const data = { foo: "bar" };

    emit(
      new FramebusConfig({
        origin: "foo",
      }),
      "event-name",
      data,
      () => {
        // noop
      }
    );

    expect(broadcast).toBeCalledTimes(1);
    expect(broadcast).toBeCalledWith(
      window.top,
      expect.stringContaining('"foo":"bar"'),
      "foo"
    );
  });

  it("broadcasts to specified channel", () => {
    const data = { foo: "bar" };

    emit(
      new FramebusConfig({
        channel: "unique-channel",
      }),
      "event-name",
      data,
      () => {
        // noop
      }
    );

    expect(broadcast).toBeCalledTimes(1);
    expect(broadcast).toBeCalledWith(
      window.top,
      expect.stringContaining('"unique-channel:event-name"'),
      "*"
    );
  });

  it("does not require data", () => {
    emit(config, "event-name", () => {
      // noop
    });

    expect(broadcast).toBeCalledTimes(1);
    expect(broadcast).toBeCalledWith(
      window.top,
      expect.stringContaining('"event-name"'),
      "*"
    );
  });

  it("does not require a callback", () => {
    emit(config, "event-name", { foo: "bar" });

    expect(broadcast).toBeCalledTimes(1);
    expect(broadcast).toBeCalledWith(
      window.top,
      expect.stringContaining('"foo":"bar"'),
      "*"
    );
  });

  it("does not require data or a callback", () => {
    emit(config, "event-name");

    expect(broadcast).toBeCalledTimes(1);
    expect(broadcast).toBeCalledWith(
      window.top,
      expect.stringContaining('"event-name"'),
      "*"
    );
  });
});
