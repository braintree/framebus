import { sendMessage } from "../../src/lib";

function mkFrame() {
  return {
    ...(window as Window),
    postMessage: jest.fn(),
    closed: false,
  };
}

describe("sendMessage()", () => {
  const payload = JSON.stringify({ something: true });
  const origin = "https://the-internet.com/";
  const frame = mkFrame();

  it("sends a message", () => {
    sendMessage(frame, payload, origin);
    expect(frame.postMessage).toBeCalledWith(payload, origin);
  });

  it("swallows error if postMessage throws", () => {
    const failFrame = mkFrame();
    failFrame.postMessage.mockImplementation(() => {
      throw new Error();
    });
    sendMessage(failFrame, payload, origin);
    expect(failFrame.postMessage).toBeCalledTimes(1);
  });
});
