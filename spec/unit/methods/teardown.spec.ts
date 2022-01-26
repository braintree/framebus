import { FramebusConfig } from "../../../src/framebus";
import { off, on, teardown } from "../../../src/methods";

jest.mock("../../../src/methods/off");

describe("teardown", () => {
  it("calls off on all listeners", () => {
    const config = new FramebusConfig();

    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const handler3 = jest.fn();

    on(config, "event-1", handler1);
    on(config, "event-2", handler2);
    on(config, "event-3", handler3);

    teardown(config);

    expect(off).toBeCalledTimes(3);
    expect(off).toBeCalledWith(config, "event-1", handler1);
    expect(off).toBeCalledWith(config, "event-2", handler2);
    expect(off).toBeCalledWith(config, "event-3", handler3);
  });
});
