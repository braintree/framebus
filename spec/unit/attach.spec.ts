import { attach, detach } from "../../src/lib/attach";
import onmessage from "../../src/lib/message";

describe("_attach", function () {
  let addEventSpy: jest.SpyInstance;

  beforeEach(function () {
    detach();
    addEventSpy = jest.spyOn(window, "addEventListener").mockImplementation();
  });

  it("should add listener to scope", function () {
    attach();

    expect(addEventSpy).toBeCalledWith("message", onmessage, false);
  });

  it("should only add listener to scope once", function () {
    attach();
    attach();

    expect(addEventSpy).toBeCalledTimes(1);
  });
});
