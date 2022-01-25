import { FramebusConfig } from "../../../src/";
import { emit, teardown } from "../../../src/methods";
import { broadcast } from "../../../src/lib/broadcast";
import { packagePayload } from "../../../src/lib/package-payload";

jest.mock("../../../src/lib/broadcast");
jest.mock("../../../src/lib/package-payload");

describe("emit", () => {
  let config: FramebusConfig;

  beforeEach(() => {
    config = new FramebusConfig();
    jest
      .mocked(packagePayload)
      .mockImplementation((eventName, origin, data, cb) => {
        if (cb) {
          cb({ returned: "data" });
        }

        return "fake-packaged-payload";
      });
  });

  it("should reject if event is not a string", async () => {
    expect.assertions(1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(emit(config, {} as any, { data: "data" })).rejects.toEqual(
      new Error("TODO")
    );
  });

  it("should rejects if origin is not a string", async () => {
    expect.assertions(1);

    await expect(
      emit(
        new FramebusConfig({
          origin: {
            foo: "object",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        }),
        "event",
        { data: "data" }
      )
    ).rejects.toEqual(new Error("TODO"));
  });

  it("should resolves if origin and event are strings", async () => {
    expect.assertions(1);

    await expect(
      emit(
        new FramebusConfig({
          origin: "https://example.com",
        }),
        "event",
        { data: "data" }
      )
    ).resolves.toEqual({ returned: "data" });
  });

  it("should resolve without passing data", async () => {
    expect.assertions(1);

    await expect(emit(config, "event")).resolves.toEqual({
      returned: "data",
    });
  });

  //   it("returns true when subscriber is added", () => {
  //     expect(emit(config, "event-name")).toBe(true);
  //     expect(emit(config, "event-name", { foo: "bar" })).toBe(true);
  //     expect(emit(config, "event-name", { foo: "bar" }, jest.fn())).toBe(true);
  //     expect(emit(config, "event-name", jest.fn())).toBe(true);
  //   });

  //   it("returns false when subscriber is not added", () => {
  //     // @ts-ignore
  //     expect(emit(config, { notAString: 12 })).toBe(false);
  //   });

  //   it("broadcasts", () => {
  //     const data = { foo: "bar" };
  //     emit(config, "event-name", data, () => {
  //       // noop
  //     });

  //     expect(broadcast).toBeCalledTimes(1);
  //     expect(broadcast).toBeCalledWith(
  //       window.top,
  //       "fake-packaged-payload",
  //       "*"
  //     );
  //   });

  //   it("does not broadcast if torn down", () => {
  //     teardown(config);

  //     expect(emit(config, "event-name")).toBe(false);
  //     expect(broadcast).toBeCalledTimes(0);
  //   });

  //   it("broadcasts to specified origin", () => {
  //     const data = { foo: "bar" };

  //     emit(
  //       new FramebusConfig({
  //         origin: "foo",
  //       }),
  //       "event-name",
  //       data,
  //       () => {
  //         // noop
  //       }
  //     );

  //     expect(broadcast).toBeCalledTimes(1);
  //     expect(broadcast).toBeCalledWith(
  //       window.top,
  //       "fake-packaged-payload",
  //       "foo"
  //     );
  //   });

  it("broadcasts to specified channel", async () => {
    const data = { foo: "bar" };

    await emit(
      new FramebusConfig({
        channel: "unique-channel",
      }),
      "event-name",
      data
    );

    expect(broadcast).toBeCalledTimes(1);
    expect(broadcast).toBeCalledWith(window.top, "fake-packaged-payload", "*");
  });

  it("does not require data", async () => {
    await emit(config, "event-name");

    expect(broadcast).toBeCalledTimes(1);
    expect(broadcast).toBeCalledWith(window.top, "fake-packaged-payload", "*");
  });
});
