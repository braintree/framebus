import { FramebusConfig } from "../../../src/framebus-config";
import { attach } from "../../../src/internal/attach";
import { initialize } from "../../../src/methods";

jest.mock("../../../src/internal/attach");
jest.mock("../../../src/framebus-config");

describe("initialize", () => {
  it("returns a FramebusConfig instance", () => {
    const config = initialize({
      channel: "channel",
      origin: "origin",
    });

    expect(FramebusConfig).toBeCalledTimes(1);
    expect(FramebusConfig).toBeCalledWith({
      channel: "channel",
      origin: "origin",
    });
    expect(config).toBeInstanceOf(FramebusConfig);
  });

  it("calls attach", () => {
    initialize({});

    expect(attach).toBeCalledTimes(1);
  });
});
