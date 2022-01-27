import { FramebusConfig } from "../../../src/framebus-config";
import { subscribers } from "../../../src/internal/constants";
import { off, on, teardown } from "../../../src/methods";

describe("off", () => {
  afterEach(() => {
    Object.keys(subscribers).forEach((subKey) => {
      delete subscribers[subKey];
    });
  });

  describe("with origin", () => {
    let config: FramebusConfig;
    const origin = "https://example.com";
    beforeEach(() => {
      config = new FramebusConfig({
        origin,
      });
    });

    it("should remove subscriber given event and origin", () => {
      const event = "the event";
      const fn = jest.fn();

      subscribers[origin] = {};
      subscribers[origin][event] = [jest.fn(), fn];

      off(config, event, fn);

      expect(subscribers[origin][event]).not.toContain(fn);
      expect(subscribers[origin][event].length).toBe(1);
    });

    it("should return true if removed", () => {
      const event = "the event";
      const fn = jest.fn();

      subscribers[origin] = {};
      subscribers[origin][event] = [jest.fn(), fn];

      const actual = off(config, event, fn);

      expect(actual).toBe(true);
    });

    it("should return false if not removed for unknown event", () => {
      const event = "the event";
      const fn = jest.fn();

      subscribers[origin] = {};
      subscribers[origin][event] = [jest.fn(), fn];

      const actual = off(config, "another event", fn);

      expect(actual).toBe(false);
    });

    it("should return false if not removed for unknown origin", () => {
      const event = "the event";
      const fn = jest.fn();

      subscribers[origin] = {};
      subscribers[origin][event] = [jest.fn(), fn];

      const actual = off(
        new FramebusConfig({ origin: "https://another.domain" }),
        event,
        fn
      );

      expect(actual).toBe(false);
    });
  });

  describe("without origin", () => {
    let config: FramebusConfig;

    beforeEach(() => {
      config = new FramebusConfig();
    });

    it("returns true when subscriber is removed", () => {
      const handler = jest.fn();
      on(config, "event-name", handler);

      expect(off(config, "event-name", handler)).toBe(true);
    });

    it("returns false when subscriber is not removed", () => {
      on(config, "event-name", jest.fn());

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(off(config, "event-without-handler")).toBe(false);
      expect(off(config, "event-without-first-calling-on", jest.fn())).toBe(
        false
      );

      on(config, "new-event", jest.fn());

      // with a new handler
      expect(off(config, "new-event", jest.fn())).toBe(false);
    });

    it("removes subscriber", () => {
      const handler = jest.fn();
      on(config, "event-name", handler);

      expect(subscribers["*"]["event-name"].length).toBe(1);

      off(config, "event-name", handler);
      expect(subscribers["*"]["event-name"].length).toBe(0);
    });

    it("does nothing when bus is torn down", () => {
      const handler = jest.fn();
      on(config, "event-name", handler);

      expect(subscribers["*"]["event-name"].length).toBe(1);

      teardown(config);

      expect(off(config, "event-name", handler)).toBe(false);

      expect(subscribers["*"]["event-name"].length).toBe(1);
    });

    it("can scope by origin", () => {
      const configWithOrigin = new FramebusConfig({
        origin: "foo",
      });

      const handler = jest.fn();
      on(config, "event-name", handler);
      on(configWithOrigin, "event-name", handler);

      expect(subscribers["*"]["event-name"].length).toBe(1);
      expect(subscribers["foo"]["event-name"].length).toBe(1);

      off(configWithOrigin, "event-name", handler);
      expect(subscribers["*"]["event-name"].length).toBe(1);
      expect(subscribers["foo"]["event-name"].length).toBe(0);
    });

    it("can scope by channel", () => {
      const configWithChannel = new FramebusConfig({
        channel: "unique-id",
      });

      const handler = jest.fn();
      on(config, "event-name", handler);
      on(configWithChannel, "event-name", handler);

      expect(subscribers["*"]["event-name"].length).toBe(1);
      expect(subscribers["*"]["unique-id:event-name"].length).toBe(1);

      off(configWithChannel, "event-name", handler);
      expect(subscribers["*"]["event-name"].length).toBe(1);
      expect(subscribers["*"]["unique-id:event-name"].length).toBe(0);
    });
  });
});
