import { emit, teardown } from "../../../src/methods";
import { broadcast } from "../../../src/lib/broadcast";
import { packagePayload } from "../../../src/lib/package-payload";
import { FramebusConfig } from "../../../src/framebus";

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

  it("should resolves when subscriber is added", async () => {
    expect.assertions(3);

    await expect(emit(config, "event-name")).resolves.toEqual({
      returned: "data",
    });

    await expect(emit(config, "event-name", { foo: "bar" })).resolves.toEqual({
      returned: "data",
    });

    await expect(emit(config, "event-name", jest.fn() as any)).resolves.toEqual(
      {
        returned: "data",
      }
    );
  });

  it("should get rejected when subscriber is not added", async () => {
    expect.assertions(1);

    await expect(emit(config, { notAString: 12 } as any)).rejects.toEqual(
      new Error("TODO")
    );
  });

  it("broadcasts", async () => {
    const data = { foo: "bar" };
    await emit(config, "event-name", data);

    expect(broadcast).toBeCalledTimes(1);
    expect(broadcast).toBeCalledWith(window.top, "fake-packaged-payload", "*");
  });

  it("does not broadcast if torn down", async () => {
    expect.assertions(2);

    teardown(config);

    await expect(emit(config, "event-name")).rejects.toEqual(new Error("TODO"));
    expect(broadcast).toBeCalledTimes(0);
  });

  it("broadcasts to specified origin", async () => {
    expect.assertions(2);

    const data = { foo: "bar" };

    await emit(
      new FramebusConfig({
        origin: "foo",
      }),
      "event-name",
      data
    );

    expect(broadcast).toBeCalledTimes(1);
    expect(broadcast).toBeCalledWith(
      window.top,
      "fake-packaged-payload",
      "foo"
    );
  });

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
