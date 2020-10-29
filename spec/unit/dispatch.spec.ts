import bus = require("../../src/");
import { dispatch } from "../../src/lib/dispatch";

describe("dispatch", () => {
  it("should execute subscribers for the given event and origin", () => {
    const subscriber = jest.fn();
    const origin = "https://example.com";

    bus.target(origin).on("test event", subscriber);

    dispatch(origin, "test event", { data: "data" });

    expect(subscriber).toBeCalled();
    expect(subscriber).toBeCalledWith({ data: "data" });
  });

  it("should not execute subscribers for a different event", () => {
    const subscriber = jest.fn();
    const origin = "https://example.com";

    bus.target(origin).on("test event", subscriber);

    dispatch(origin, "different event", { data: "data" });

    expect(subscriber).not.toBeCalled();
  });

  it("should not execute subscribers for a different domain", () => {
    const subscriber = jest.fn();
    const origin = "https://example.com";

    bus.target(origin).on("test event", subscriber);

    dispatch("https://domain.com", "test event", { data: "data" });

    expect(subscriber).not.toBeCalled();
  });

  it("can pass a reply handler", () => {
    const subscriber = jest.fn();
    const reply = jest.fn();
    const origin = "https://example.com";

    bus.target(origin).on("test event", subscriber);

    dispatch(origin, "test event", { data: "data" }, reply);

    expect(subscriber).toBeCalled();
    expect(subscriber).toBeCalledWith({ data: "data" }, reply);
  });

  it("can pass a reply handler wthout data", () => {
    const subscriber = jest.fn();
    const reply = jest.fn();
    const origin = "https://example.com";

    bus.target(origin).on("test event", subscriber);

    // eslint-disable-next-line no-undefined
    dispatch(origin, "test event", undefined, reply);

    expect(subscriber).toBeCalled();
    expect(subscriber).toBeCalledWith(reply);
  });
});
