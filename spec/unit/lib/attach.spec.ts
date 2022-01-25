import { attach, detach } from "../../../src/lib/attach";
import { onmessage } from "../../../src/lib/message";

describe("_attach", () => {
  let addEventSpy: jest.SpyInstance;

  beforeEach(() => {
    detach();
    addEventSpy = jest.spyOn(window, "addEventListener").mockImplementation();
  });

  it("should add listener to scope", () => {
    attach();

    expect(addEventSpy).toBeCalledWith("message", onmessage, false);
  });

  it("should only add listener to scope once", () => {
    attach();
    attach();

    expect(addEventSpy).toBeCalledTimes(1);
  });
});
