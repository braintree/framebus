import framebus = require("../../src");
import ScopedBus = require("../../src/scoped-bus");

import { mocked } from "ts-jest/utils";

jest.mock("framebus");

describe("ScopedBus", () => {
  let handler: jest.Mock;

  beforeEach(() => {
    jest.spyOn(framebus, "on");
    jest.spyOn(framebus, "off");
    jest.spyOn(framebus, "emit");

    handler = jest.fn();
  });

  afterEach(() => {
    mocked(framebus.on).mockReset();
    mocked(framebus.off).mockReset();
    mocked(framebus.emit).mockReset();
  });

  describe("on", () => {
    it(`proxies to Framebus's on`, () => {
      const bus = new ScopedBus({ channel: "foo" });

      bus.on("event", handler);

      expect(framebus.on).toHaveBeenCalledWith(`Bus:foo:event`, handler);
    });
  });

  describe("off", () => {
    it(`proxies to Framebus's off`, () => {
      const bus = new ScopedBus({ channel: "foo" });

      bus.off("event", handler);

      expect(framebus.off).toHaveBeenCalledWith(`Bus:foo:event`, handler);
    });
  });

  describe("emit", () => {
    it(`proxies to Framebus's emit`, () => {
      const bus = new ScopedBus({ channel: "foo" });

      bus.emit("event", handler);

      expect(framebus.emit).toHaveBeenCalledWith(`Bus:foo:event`, handler);
    });
  });

  describe("teardown", () => {
    it("calls off for every added listener, even ones already removed", () => {
      const bus = new ScopedBus({ channel: "foo" });

      const event1 = "event-1";
      const event2 = "event-2";
      const event3 = "event-3";

      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      bus.on(event1, handler1);
      bus.on(event2, handler2);
      bus.on(event3, handler3);

      bus.off(event2, handler2);

      bus.teardown();

      expect(framebus.off).toHaveBeenCalledWith(
        expect.stringContaining(event1),
        handler1
      );
      expect(framebus.off).toHaveBeenCalledWith(
        expect.stringContaining(event2),
        handler2
      );
      expect(framebus.off).toHaveBeenCalledWith(
        expect.stringContaining(event3),
        handler3
      );
    });

    it("only unsubscribes from events once", () => {
      const bus = new ScopedBus({ channel: "foo" });

      bus.on("event", handler);

      bus.teardown();
      bus.teardown();

      expect(framebus.off).toHaveBeenCalledTimes(1);
    });

    it("doesn't proxy to framebus after it is torn down", () => {
      const bus = new ScopedBus({ channel: "foo" });
      bus.teardown();

      bus.on("event", handler);
      expect(framebus.on).not.toHaveBeenCalled();

      bus.off("event", handler);
      expect(framebus.off).not.toHaveBeenCalled();

      bus.emit("event");
      expect(framebus.emit).not.toHaveBeenCalled();
    });
  });
});
