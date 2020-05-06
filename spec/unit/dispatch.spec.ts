import bus = require("../../src/");
import dispatch from "../../src/lib/dispatch";

describe("dispatch", function () {
  it("should execute subscribers for the given event and origin", function () {
    const subscriber = jest.fn();
    const origin = "https://example.com";

    bus.target(origin).on("test event", subscriber);

    dispatch(origin, "test event", { data: "data" });

    expect(subscriber).toBeCalled();
    expect(subscriber).toBeCalledWith({ data: "data" });
  });

  it("should not execute subscribers for a different event", function () {
    const subscriber = jest.fn();
    const origin = "https://example.com";

    bus.target(origin).on("test event", subscriber);

    dispatch(origin, "different event", { data: "data" });

    expect(subscriber).not.toBeCalled();
  });

  it("should not execute subscribers for a different domain", function () {
    const subscriber = jest.fn();
    const origin = "https://example.com";

    bus.target(origin).on("test event", subscriber);

    dispatch("https://domain.com", "test event", { data: "data" });

    expect(subscriber).not.toBeCalled();
  });

  it("can pass a reply handler", function () {
    const subscriber = jest.fn();
    const reply = jest.fn();
    const origin = "https://example.com";

    bus.target(origin).on("test event", subscriber);

    dispatch(origin, "test event", { data: "data" }, reply);

    expect(subscriber).toBeCalled();
    expect(subscriber).toBeCalledWith({ data: "data" }, reply);
  });

  it("can pass a reply handler wthout data", function () {
    const subscriber = jest.fn();
    const reply = jest.fn();
    const origin = "https://example.com";

    bus.target(origin).on("test event", subscriber);

    dispatch(origin, "test event", undefined, reply);

    expect(subscriber).toBeCalled();
    expect(subscriber).toBeCalledWith(reply);
  });
});
