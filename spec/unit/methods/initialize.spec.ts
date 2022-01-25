import { attach } from "../../../src/lib/attach";
import { FramebusConfig } from "../../../src/";
import { initialize } from "../../../src/methods";

jest.mock("../../../src/lib/attach");
jest.mock("../../../src/framebus");

describe("initialize", () => {
  it("returns a FramebusConfig instanct", () => {
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
