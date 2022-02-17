import { FramebusConfig } from "../../../src/framebus-config";
import { once } from "../../../src/methods";
import { on } from "../../../src/methods/on";
import { off } from "../../../src/methods/off";

jest.mock("../../../src/methods/on");
jest.mock("../../../src/methods/off");

describe("once", () => {
  let framebusConfig: FramebusConfig;

  beforeEach(() => {
    framebusConfig = new FramebusConfig();
  });

  it("returns the value of on", () => {
    jest.mocked(on).mockReturnValue(true);

    const value = once(framebusConfig, "event-name", jest.fn());

    expect(value).toBe(true);
  });

  it("calls off when calling original handler", () => {
    const originalHandler = jest.fn();

    once(framebusConfig, "event-name", originalHandler);

    const handler = jest.mocked(on).mock.calls[0][2];

    expect(on).toBeCalledTimes(1);
    expect(on).toBeCalledWith(framebusConfig, "event-name", handler);

    expect(handler).not.toBe(originalHandler);

    expect(originalHandler).not.toBeCalled();
    expect(off).not.toBeCalled();

    const replySpy = jest.fn();
    handler({ data: "foo" }, replySpy);

    expect(originalHandler).toBeCalledTimes(1);
    expect(originalHandler).toBeCalledWith({ data: "foo" }, replySpy);

    expect(off).toBeCalledTimes(1);
    expect(off).toBeCalledWith(framebusConfig, "event-name", handler);
  });
});
