/* eslint-disable @typescript-eslint/ban-ts-comment */

jest.mock("../../src/lib/broadcast");

import { attach } from "../../src/lib/attach";
import { broadcast } from "../../src/lib/broadcast";
import { Framebus } from "../../src/framebus";
import { subscribers } from "../../src/lib/constants";

describe("Framebus", () => {
  let bus: Framebus;
  const { location } = window;

  beforeEach(() => {
    bus = new Framebus();
    attach();
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = {
      href: "",
    };
  });

  afterAll(() => {
    window.location = location;
  });

  afterEach(() => {
    Object.keys(subscribers).forEach((subKey) => {
      delete subscribers[subKey];
    });
  });

  // describe("target", () => {
  //   it("returns a new Framebus isntance", () => {
  //     const instance = Framebus.target();

  //     expect(instance).toBeInstanceOf(Framebus);
  //   });

  //   it("can pass setup options", () => {
  //     const instance = Framebus.target({
  //       channel: "unique-channel",
  //       origin: "unique-origin",
  //     });

  //     expect(instance.channel).toBe("unique-channel");
  //     expect(instance.origin).toBe("unique-origin");
  //   });

  //   it("uses static version when called on instance", () => {
  //     const instance = new Framebus();

  //     jest.spyOn(Framebus, "target").mockImplementation();

  //     instance.target({
  //       channel: "unique-channel",
  //       origin: "unique-origin",
  //     });

  //     expect(Framebus.target).toBeCalledTimes(1);
  //     expect(Framebus.target).toBeCalledWith({
  //       channel: "unique-channel",
  //       origin: "unique-origin",
  //     });
  //   });
  // });



});
