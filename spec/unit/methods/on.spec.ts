import { FramebusConfig } from "../../../src/framebus-config";
import { subscribers } from "../../../src/internal/constants";
import { on, teardown } from "../../../src/methods";

describe("on", () => {
  let config: FramebusConfig;
  const { location } = window;

  beforeEach(() => {
    config = new FramebusConfig();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete window.location;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.location = {
      href: "",
    };
  });

  afterEach(() => {
    Object.keys(subscribers).forEach((subKey) => {
      delete subscribers[subKey];
    });
    window.location = location;
  });

  it("should add subscriber to given event and origin", () => {
    const event = "event name";
    const origin = "https://example.com";
    const fn = jest.fn();

    on(
      new FramebusConfig({
        origin,
      }),
      event,
      fn
    );

    expect(subscribers[origin][event]).toEqual(expect.arrayContaining([fn]));
  });

  it("should add subscriber to given event and * origin if origin not given", () => {
    const event = "event name";
    const fn = jest.fn();

    on(new FramebusConfig(), event, fn);

    expect(subscribers["*"][event]).toEqual(expect.arrayContaining([fn]));
  });

  it("returns true when listener is added", () => {
    expect(on(config, "event-name", jest.fn())).toBe(true);
  });

  it("returns true when listener is added", () => {
    expect(on(config, "event-name", jest.fn())).toBe(true);
  });

  it("returns false when listener is not added", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(on(config, "on-without-a-handler")).toBe(false);
  });

  it("listens for event", () => {
    const handler = jest.fn();
    on(new FramebusConfig(), "event-name", handler);

    expect(subscribers["*"]["event-name"][0]).toBe(handler);
  });

  it("can listen multiple times for event", () => {
    const handler = jest.fn();
    const handler2 = jest.fn();
    const handler3 = jest.fn();
    on(config, "event-name", handler);
    on(config, "event-name", handler2);
    on(config, "event-name", handler3);

    expect(subscribers["*"]["event-name"][0]).toBe(handler);
    expect(subscribers["*"]["event-name"][1]).toBe(handler2);
    expect(subscribers["*"]["event-name"][2]).toBe(handler3);
  });

  it("does not subscribe handler when bus is torn down", () => {
    teardown(config);

    expect(on(config, "event-name", jest.fn())).toBe(false);

    expect(subscribers).toEqual({});
  });

  it("can scope to origin", () => {
    const handler = jest.fn();
    on(
      new FramebusConfig({
        origin: "foo",
      }),
      "event-name",
      handler
    );

    expect(subscribers["foo"]["event-name"][0]).toBe(handler);
  });

  it("can scope to channel", () => {
    const handler = jest.fn();
    on(
      new FramebusConfig({
        channel: "unique-channel",
      }),
      "event-name",
      handler
    );

    expect(subscribers["*"]["unique-channel:event-name"][0]).toBe(handler);
  });

  it("modifies handler if verifyDomain is used", () => {
    const verifyDomainConfig = new FramebusConfig({
      verifyDomain: jest.fn().mockReturnValue(true),
    });
    const handler = jest.fn();
    on(verifyDomainConfig, "event-name", handler);

    const newHandler = subscribers["*"]["event-name"][0];

    expect(newHandler).toBeInstanceOf(Function);
    expect(newHandler).not.toBe(handler);

    const cb = jest.fn();
    newHandler(
      {
        data: "foo",
      },
      cb
    );

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith({ data: "foo" }, cb);
  });

  it("does call original handler when a verification domain method is passed and the check passes", () => {
    const verifyDomainConfig = new FramebusConfig({
      verifyDomain(url) {
        return url === "https://not-example.com/allowed";
      },
    });
    const handler = jest.fn();
    on(verifyDomainConfig, "event-name", handler);
    const newHandler = subscribers["*"]["event-name"][0];

    expect(newHandler).toBeInstanceOf(Function);
    expect(newHandler).not.toBe(handler);

    const cb = jest.fn();
    newHandler.call(
      {
        origin: "https://not-example.com/dissallowed",
      },
      {
        data: "disallowed",
      },
      cb
    );

    expect(handler).toBeCalledTimes(0);

    newHandler.call(
      {
        origin: "https://not-example.com/allowed",
      },
      {
        data: "allowed",
      },
      cb
    );

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith({ data: "allowed" }, cb);
  });

  it("does not call original handler when a verification domain method is passed and the check fails", () => {
    const handler = jest.fn();
    on(
      new FramebusConfig({
        verifyDomain() {
          return false;
        },
      }),
      "event-name",
      handler
    );

    const newHandler = subscribers["*"]["event-name"][0];

    expect(newHandler).toBeInstanceOf(Function);
    expect(newHandler).not.toBe(handler);

    const cb = jest.fn();
    newHandler(
      {
        data: "foo",
      },
      cb
    );

    expect(handler).toBeCalledTimes(0);
  });

  it("does call original handler when a verification domain method fails, but post message origin matches location.href", () => {
    window.location.href = "https://example.com";

    const handler = jest.fn();
    on(
      new FramebusConfig({
        verifyDomain() {
          return false;
        },
      }),
      "event-name",
      handler
    );

    const newHandler = subscribers["*"]["event-name"][0];

    expect(newHandler).toBeInstanceOf(Function);
    expect(newHandler).not.toBe(handler);

    const cb = jest.fn();
    newHandler.call(
      {
        origin: "https://example.com",
      },
      {
        data: "allowed",
      },
      cb
    );

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith({ data: "allowed" }, cb);
  });

  it("does call original handler when a verification domain method fails, but post message origin matches location.href (ignoringg http port)", () => {
    window.location.href = "http://example.com:80";
    const verifyDomainConfig = new FramebusConfig({
      verifyDomain() {
        return false;
      },
    });
    const handler = jest.fn();
    on(verifyDomainConfig, "event-name", handler);

    const newHandler = subscribers["*"]["event-name"][0];

    expect(newHandler).toBeInstanceOf(Function);
    expect(newHandler).not.toBe(handler);

    const cb = jest.fn();
    newHandler.call(
      {
        origin: "http://example.com",
      },
      {
        data: "allowed",
      },
      cb
    );

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith({ data: "allowed" }, cb);
  });

  it("does call original handler when a verification domain method fails, but post message origin matches location.href (ignoringg ssl port)", () => {
    window.location.href = "https://example.com:443";
    const verifyDomainConfig = new FramebusConfig({
      verifyDomain() {
        return false;
      },
    });
    const handler = jest.fn();
    on(verifyDomainConfig, "event-name", handler);

    const newHandler = subscribers["*"]["event-name"][0];

    expect(newHandler).toBeInstanceOf(Function);
    expect(newHandler).not.toBe(handler);

    const cb = jest.fn();
    newHandler.call(
      {
        origin: "https://example.com",
      },
      {
        data: "allowed",
      },
      cb
    );

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith({ data: "allowed" }, cb);
  });

  it("does not call original handler when a verification domain method fails and parent url matches but non-standard port is used", () => {
    window.location.href = "https://example.com:123";
    const handler = jest.fn();
    on(
      new FramebusConfig({
        verifyDomain() {
          return false;
        },
      }),
      "event-name",
      handler
    );

    const newHandler = subscribers["*"]["event-name"][0];

    expect(newHandler).toBeInstanceOf(Function);
    expect(newHandler).not.toBe(handler);

    const cb = jest.fn();
    newHandler.call(
      {
        origin: "https://example.com",
      },
      {
        data: "foo",
      },
      cb
    );

    expect(handler).toBeCalledTimes(0);
  });

  it("does not call original handler when a verification domain method fails and location.href domain matches but protocol does not", () => {
    window.location.href = "https://example.com";

    const handler = jest.fn();
    on(
      new FramebusConfig({
        verifyDomain() {
          return false;
        },
      }),
      "event-name",
      handler
    );

    const newHandler = subscribers["*"]["event-name"][0];

    expect(newHandler).toBeInstanceOf(Function);
    expect(newHandler).not.toBe(handler);

    const cb = jest.fn();
    newHandler.call(
      {
        origin: "http://example.com",
      },
      {
        data: "foo",
      },
      cb
    );

    expect(handler).toBeCalledTimes(0);
  });
});
