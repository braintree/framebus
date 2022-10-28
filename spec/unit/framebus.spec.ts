/* eslint-disable @typescript-eslint/ban-ts-comment */

jest.mock("../../src/lib/broadcast");

import { attach } from "../../src/lib/attach";
import { broadcast } from "../../src/lib/broadcast";
import { Framebus } from "../../src/framebus";
import { subscribers } from "../../src/lib/constants";

describe("Framebus", () => {
  let bus: Framebus;
  const { location } = window;

  beforeEach(() => {
    bus = new Framebus();
    attach();
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = {
      href: "",
    };
  });

  afterAll(() => {
    window.location = location;
  });

  afterEach(() => {
    Object.keys(subscribers).forEach((subKey) => {
      delete subscribers[subKey];
    });
  });

  describe("target", () => {
    it("returns a new Framebus isntance", () => {
      const instance = Framebus.target();

      expect(instance).toBeInstanceOf(Framebus);
    });

    it("can pass setup options", () => {
      const instance = Framebus.target({
        channel: "unique-channel",
        origin: "unique-origin",
      });

      expect(instance.channel).toBe("unique-channel");
      expect(instance.origin).toBe("unique-origin");
    });

    it("uses static version when called on instance", () => {
      const instance = new Framebus();

      jest.spyOn(Framebus, "target").mockImplementation();

      instance.target({
        channel: "unique-channel",
        origin: "unique-origin",
      });

      expect(Framebus.target).toBeCalledTimes(1);
      expect(Framebus.target).toBeCalledWith({
        channel: "unique-channel",
        origin: "unique-origin",
      });
    });
  });

  describe("setPromise", () => {
    it("sets a custom Promise object", () => {
      const FakePromise = {} as typeof Framebus["Promise"];

      Framebus.setPromise(FakePromise);

      expect(Framebus.Promise).toBe(FakePromise);

      Framebus.setPromise(Promise);
    });
  });

  describe("include", () => {
    it("returns false if no widow is passed", () => {
      // @ts-ignore
      expect(bus.include()).toBe(false);
    });

    it("returns false if window has no Window propeerty", () => {
      // @ts-ignore
      expect(bus.include({})).toBe(false);
    });

    it("returns false if window's constructor does not equal the Window property", () => {
      expect(
        bus.include({
          // @ts-ignore
          Window: "fake window",
        })
      ).toBe(false);
    });

    it("returns true if window is included", () => {
      const fakeWindow = {};

      expect(
        bus.include({
          // @ts-ignore
          Window: fakeWindow,
          // @ts-ignore
          constructor: fakeWindow,
        })
      ).toBe(true);
    });

    it("includes the frame in the targetFrames property, when configured", () => {
      const fakeWindow = {};
      const frame = {
        // @ts-ignore
        Window: fakeWindow,
        // @ts-ignore
        constructor: fakeWindow,
      };
      const targetFrames = [] as Window[];
      const busWithTargetFrames = new Framebus({
        targetFrames,
      });

      const targets = busWithTargetFrames.targetFrames as Window[];

      expect(targets.length).toBe(0);

      // @ts-ignore
      busWithTargetFrames.include(frame);

      expect(targets.length).toBe(1);
      expect(targets[0]).toBe(frame);
    });
  });

  describe("emit", () => {
    it("returns true when subscriber is added", () => {
      expect(bus.emit("event-name")).toBe(true);
      expect(bus.emit("event-name", { foo: "bar" })).toBe(true);
      expect(bus.emit("event-name", { foo: "bar" }, jest.fn())).toBe(true);
      expect(bus.emit("event-name", jest.fn())).toBe(true);
    });

    it("returns false when subscriber is not added", () => {
      // @ts-ignore
      expect(bus.emit({ notAString: 12 })).toBe(false);
    });

    it("broadcasts", () => {
      const data = { foo: "bar" };
      bus.emit("event-name", data, () => {
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
      bus.teardown();

      expect(bus.emit("event-name")).toBe(false);
      expect(broadcast).toBeCalledTimes(0);
    });

    it("broadcasts to specified origin", () => {
      bus = new Framebus({
        origin: "foo",
      });

      const data = { foo: "bar" };
      bus.emit("event-name", data, () => {
        // noop
      });

      expect(broadcast).toBeCalledTimes(1);
      expect(broadcast).toBeCalledWith(
        window.top,
        expect.stringContaining('"foo":"bar"'),
        "foo"
      );
    });

    it("broadcasts to specified channel", () => {
      bus = new Framebus({
        channel: "unique-channel",
      });

      const data = { foo: "bar" };
      bus.emit("event-name", data, () => {
        // noop
      });

      expect(broadcast).toBeCalledTimes(1);
      expect(broadcast).toBeCalledWith(
        window.top,
        expect.stringContaining('"unique-channel:event-name"'),
        "*"
      );
    });

    it("does not require data", () => {
      bus.emit("event-name", () => {
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
      bus.emit("event-name", { foo: "bar" });

      expect(broadcast).toBeCalledTimes(1);
      expect(broadcast).toBeCalledWith(
        window.top,
        expect.stringContaining('"foo":"bar"'),
        "*"
      );
    });

    it("does not require data or a callback", () => {
      bus.emit("event-name");

      expect(broadcast).toBeCalledTimes(1);
      expect(broadcast).toBeCalledWith(
        window.top,
        expect.stringContaining('"event-name"'),
        "*"
      );
    });
  });

  describe("emitAsPromise", () => {
    it("rejects when emit does not attach", async () => {
      expect.assertions(1);

      jest.spyOn(bus, "emit").mockReturnValue(false);

      try {
        await bus.emitAsPromise("event-name");
      } catch (err) {
        expect((err as Error).message).toBe(
          'Listener not added for "event-name"'
        );
      }
    });

    it("resolves when emit's callback is called", async () => {
      const payload = { data: "yay" };

      jest.spyOn(bus, "emit").mockImplementation((eventName, data, cb) => {
        if (cb) {
          cb(payload);
        }

        return true;
      });

      const result = await bus.emitAsPromise("event-name");

      expect(bus.emit).toBeCalledTimes(1);
      expect(bus.emit).toBeCalledWith(
        "event-name",
        // eslint-disable-next-line no-undefined
        undefined,
        expect.any(Function)
      );
      expect(result).toBe(payload);
    });

    it("can pass data to emit", async () => {
      const payload = { data: "yay" };

      jest.spyOn(bus, "emit").mockImplementation((eventName, data, cb) => {
        if (cb) {
          cb(payload);
        }

        return true;
      });

      await bus.emitAsPromise("event-name", { foo: "bar" });

      expect(bus.emit).toBeCalledTimes(1);
      expect(bus.emit).toBeCalledWith(
        "event-name",
        { foo: "bar" },
        expect.any(Function)
      );
    });
  });

  describe("on", () => {
    it("returns true when listener is added", () => {
      expect(bus.on("event-name", jest.fn())).toBe(true);
    });

    it("returns false when listener is not added", () => {
      // @ts-ignore
      expect(bus.on("on-without-a-handler")).toBe(false);
    });

    it("listens for event", () => {
      const handler = jest.fn();
      bus.on("event-name", handler);

      expect(subscribers["*"]["event-name"][0]).toBe(handler);
    });

    it("can listen multiple times for event", () => {
      const handler = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      bus.on("event-name", handler);
      bus.on("event-name", handler2);
      bus.on("event-name", handler3);

      expect(subscribers["*"]["event-name"][0]).toBe(handler);
      expect(subscribers["*"]["event-name"][1]).toBe(handler2);
      expect(subscribers["*"]["event-name"][2]).toBe(handler3);
    });

    it("does not subscribe handler when bus is torn down", () => {
      bus.teardown();

      expect(bus.on("event-name", jest.fn())).toBe(false);

      expect(subscribers).toEqual({});
    });

    it("can scope to origin", () => {
      bus = new Framebus({
        origin: "foo",
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

      expect(subscribers["foo"]["event-name"][0]).toBe(handler);
    });

    it("can scope to channel", () => {
      bus = new Framebus({
        channel: "unique-channel",
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

      expect(subscribers["*"]["unique-channel:event-name"][0]).toBe(handler);
    });

    it("modifies handler if verifyDomain is used", () => {
      bus = new Framebus({
        verifyDomain: jest.fn().mockReturnValue(true),
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

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

    it("does not call original handler when a verification domain method is passed and the check fails", () => {
      bus = new Framebus({
        verifyDomain() {
          return false;
        },
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

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

    it("does call original handler when a verification domain method is passed and the check passes", () => {
      bus = new Framebus({
        verifyDomain(url) {
          return url === "https://not-example.com/allowed";
        },
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

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

    it("does call original handler when a verification domain method fails, but post message origin matches location.href", () => {
      window.location.href = "https://example.com";
      bus = new Framebus({
        verifyDomain() {
          return false;
        },
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

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

    it("does call original handler when a verification domain method fails, but post message origin matches location.href (ignoringg ssl port)", () => {
      window.location.href = "https://example.com:443";
      bus = new Framebus({
        verifyDomain() {
          return false;
        },
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

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
      bus = new Framebus({
        verifyDomain() {
          return false;
        },
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

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

    it("does not call original handler when a verification domain method fails and parent url matches but non-standard port is used", () => {
      window.location.href = "https://example.com:123";
      bus = new Framebus({
        verifyDomain() {
          return false;
        },
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

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
      bus = new Framebus({
        verifyDomain() {
          return false;
        },
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

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

    it("modifies handler if targetFrames is used", () => {
      const iframe = document.createElement("iframe");
      document.body.append(iframe);

      const busWithTargettedFrames = new Framebus({
        targetFrames: [iframe],
      });
      const handler = jest.fn();
      busWithTargettedFrames.on("event-name", handler);

      const newHandler = subscribers["*"]["event-name"][0];

      expect(newHandler).toBeInstanceOf(Function);
      expect(newHandler).not.toBe(handler);

      const cb = jest.fn();
      newHandler.call(
        {
          source: iframe.contentWindow,
        },
        {
          data: "foo",
        },
        cb
      );

      expect(handler).toBeCalledTimes(1);
      expect(handler).toBeCalledWith({ data: "foo" }, cb);
    });

    it("does not call original handler when a targetFrames is passed and source is not found in the targetFrames", () => {
      const iframe = document.createElement("iframe");
      document.body.append(iframe);

      bus = new Framebus({
        targetFrames: [iframe],
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

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

    it("does call original handler when a source is found inside targetFrames", () => {
      const iframe = document.createElement("iframe");
      document.body.append(iframe);

      bus = new Framebus({
        targetFrames: [iframe],
      });
      const handler = jest.fn();
      bus.on("event-name", handler);

      const newHandler = subscribers["*"]["event-name"][0];

      expect(newHandler).toBeInstanceOf(Function);
      expect(newHandler).not.toBe(handler);

      const cb = jest.fn();
      newHandler.call(
        {
          origin: "https://example.com",
        },
        {
          data: "disallowed",
        },
        cb
      );

      expect(handler).toBeCalledTimes(0);

      newHandler.call(
        {
          source: iframe.contentWindow,
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
  });

  describe("off", () => {
    it("returns true when subscriber is removed", () => {
      const handler = jest.fn();
      bus.on("event-name", handler);

      expect(bus.off("event-name", handler)).toBe(true);
    });

    it("returns false when subscriber is not removed", () => {
      bus.on("event-name", jest.fn());

      // @ts-ignore
      expect(bus.off("event-without-handler")).toBe(false);
      expect(bus.off("event-without-first-calling-on", jest.fn())).toBe(false);

      bus.on("new-event", jest.fn());

      // with a new handler
      expect(bus.off("new-event", jest.fn())).toBe(false);
    });

    it("removes subscriber", () => {
      const handler = jest.fn();
      bus.on("event-name", handler);

      expect(subscribers["*"]["event-name"].length).toBe(1);

      bus.off("event-name", handler);
      expect(subscribers["*"]["event-name"].length).toBe(0);
    });

    it("does nothing when bus is torn down", () => {
      const handler = jest.fn();
      bus.on("event-name", handler);

      expect(subscribers["*"]["event-name"].length).toBe(1);

      bus.teardown();

      expect(bus.off("event-name", handler)).toBe(false);

      expect(subscribers["*"]["event-name"].length).toBe(1);
    });

    it("can scope by origin", () => {
      const busWithOrigin = new Framebus({
        origin: "foo",
      });

      const handler = jest.fn();
      bus.on("event-name", handler);
      busWithOrigin.on("event-name", handler);

      expect(subscribers["*"]["event-name"].length).toBe(1);
      expect(subscribers["foo"]["event-name"].length).toBe(1);

      busWithOrigin.off("event-name", handler);
      expect(subscribers["*"]["event-name"].length).toBe(1);
      expect(subscribers["foo"]["event-name"].length).toBe(0);
    });

    it("can scope by channel", () => {
      const busWithChannel = new Framebus({
        channel: "unique-id",
      });

      const handler = jest.fn();
      bus.on("event-name", handler);
      busWithChannel.on("event-name", handler);

      expect(subscribers["*"]["event-name"].length).toBe(1);
      expect(subscribers["*"]["unique-id:event-name"].length).toBe(1);

      busWithChannel.off("event-name", handler);
      expect(subscribers["*"]["event-name"].length).toBe(1);
      expect(subscribers["*"]["unique-id:event-name"].length).toBe(0);
    });
  });

  describe("teardown", () => {
    it("calls off on all listeners", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      jest.spyOn(bus, "off");

      bus.on("event-1", handler1);
      bus.on("event-2", handler2);
      bus.on("event-3", handler3);

      bus.teardown();

      expect(bus.off).toBeCalledTimes(3);
      expect(bus.off).toBeCalledWith("event-1", handler1);
      expect(bus.off).toBeCalledWith("event-2", handler2);
      expect(bus.off).toBeCalledWith("event-3", handler3);
    });
  });
});
