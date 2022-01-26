import { emit } from "../../../src/methods/emit";
import { emitAsPromise } from "../../../src/methods";
import { FramebusConfig } from "../../../src/framebus-config";

jest.mock("../../../src/methods/emit");

describe("emitAsPromise", () => {
  let config: FramebusConfig;

  beforeEach(() => {
    config = new FramebusConfig();
    jest.mocked(emit).mockReturnValue(true);
  });
  it("rejects when emit does not attach", async () => {
    expect.assertions(1);

    jest.mocked(emit).mockReturnValue(false);

    await expect(emitAsPromise(config, "event-name")).rejects.toEqual(
      new Error('Listener not added for "event-name"')
    );
  });

  it("resolves when emit's callback is called", async () => {
    const payload = { data: "yay" };

    jest.mocked(emit).mockImplementation((config, eventName, data, cb) => {
      if (cb) {
        cb(payload);
      }

      return true;
    });

    const result = await emitAsPromise(config, "event-name");

    expect(emit).toBeCalledTimes(1);
    expect(emit).toBeCalledWith(
      config,
      "event-name",
      // eslint-disable-next-line no-undefined
      undefined,
      expect.any(Function)
    );
    expect(result).toBe(payload);
  });

  it("can pass data to emit", async () => {
    const payload = { data: "yay" };

    jest.mocked(emit).mockImplementation((config, eventName, data, cb) => {
      if (cb) {
        cb(payload);
      }

      return true;
    });

    await emitAsPromise(config, "event-name", { foo: "bar" });

    expect(emit).toBeCalledTimes(1);
    expect(emit).toBeCalledWith(
      config,
      "event-name",
      { foo: "bar" },
      expect.any(Function)
    );
  });
});
