import { subscribers } from "../../../src/lib/constants";
import { FramebusConfig } from "../../../src/";
import { on } from "../../../src/methods";

describe("on", () => {
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
});
