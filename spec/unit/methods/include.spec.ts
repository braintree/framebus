/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FramebusConfig } from "../../../src/framebus";
import { include } from "../../../src/methods";

describe("include", () => {
  let config: FramebusConfig;

  beforeEach(() => {
    config = new FramebusConfig();
  });

  it("returns false if no widow is passed", () => {
    // @ts-ignore
    expect(include(config)).toBe(false);
  });

  it("returns false if window has no Window propeerty", () => {
    // @ts-ignore
    expect(include(config, {})).toBe(false);
  });

  it("returns false if window's constructor does not equal the Window property", () => {
    expect(
      include(config, {
        // @ts-ignore
        Window: "fake window",
      })
    ).toBe(false);
  });

  it("returns true if window is included", () => {
    const fakeWindow = {};

    expect(
      include(config, {
        // @ts-ignore
        Window: fakeWindow,
        // @ts-ignore
        constructor: fakeWindow,
      })
    ).toBe(true);
  });
});
