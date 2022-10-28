import { broadcast } from "../../src/lib/broadcast";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function mkFrame() {
  return {
    ...(window as Window),
    postMessage: jest.fn(),
    closed: false,
  };
}

describe("broadcast", () => {
  it("should not throw exception when postMessage is denied", () => {
    const frame = mkFrame();
    frame.postMessage.mockImplementation(() => {
      throw new Error("Invalid calling object");
    });

    expect(() => {
      broadcast("payload", {
        origin: "*",
        frames: [frame],
        limitBroadcastToFramesArray: false,
      });
    }).not.toThrowError();
  });

  it("should postMessage to current frame", () => {
    const frame = mkFrame();

    broadcast("payload", {
      origin: "*",
      frames: [frame],
      limitBroadcastToFramesArray: false,
    });

    expect(frame.postMessage).toBeCalled();
  });

  it("should postMessage to current frame's child frames", () => {
    const frame = mkFrame();
    frame.frames[0] = mkFrame();

    broadcast("payload", {
      origin: "*",
      frames: [frame],
      limitBroadcastToFramesArray: false,
    });

    expect(frame.frames[0].postMessage).toBeCalled();
  });

  describe("to opener", () => {
    it("should postMessage to window.top.opener if it exists", () => {
      const frame = mkFrame();

      frame.opener = mkFrame();
      frame.top = frame;
      frame.opener.top = frame.opener;

      broadcast("payload", {
        origin: "*",
        frames: [frame],
        limitBroadcastToFramesArray: false,
      });

      expect(frame.opener.top.postMessage).toBeCalled();
    });

    it("should not postMessage to window.opener if it has closed", () => {
      const frame = mkFrame();

      frame.opener = {
        postMessage: jest.fn(),
        frames: [],
        closed: true,
      };
      frame.opener.top = frame.opener;
      frame.top = frame;

      broadcast("payload", {
        origin: "*",
        frames: [frame],
        limitBroadcastToFramesArray: false,
      });

      expect(frame.opener.top.postMessage).not.toBeCalled();
    });

    it("should not infinitely recurse if opener is itself", function (done) {
      const frame = mkFrame();

      jest.setTimeout(10);
      frame.opener = frame;
      frame.top = frame;

      broadcast("payload", {
        origin: "*",
        frames: [frame],
        limitBroadcastToFramesArray: false,
      });

      // don't infinitely recurse
      done();
    });

    it("should not infinitely recurse if opener is parent", function (done) {
      const frame = mkFrame();
      const child = mkFrame();

      child.opener = frame;
      child.parent = frame;
      child.top = frame;

      frame.frames[0] = child;
      frame.top = frame;

      broadcast("payload", {
        origin: "*",
        frames: [frame],
        limitBroadcastToFramesArray: false,
      });

      // don't infinitely recurse
      done();
    });

    it("should not postMessage to window.top.opener if limitBroadcastToFramesArray is true", () => {
      const frame = mkFrame();

      frame.opener = mkFrame();
      frame.top = frame;
      frame.opener.top = frame.opener;

      broadcast("payload", {
        origin: "*",
        frames: [frame],
        limitBroadcastToFramesArray: true,
      });

      expect(frame.opener.top.postMessage).not.toBeCalled();
    });

    it("should postMessage to the window.opener's child frames", () => {
      const frame = mkFrame();
      const openerFrame = mkFrame();

      openerFrame.frames[0] = mkFrame();

      frame.opener = openerFrame;
      frame.opener.top = frame.opener;
      frame.top = frame;

      broadcast("payload", {
        origin: "*",
        frames: [frame],
        limitBroadcastToFramesArray: false,
      });

      expect(frame.opener.top.frames[0].postMessage).toBeCalled();
    });

    it("should not postMessage to the window.opener's child frames when limitBroadcastToFramesArray is true", () => {
      const frame = mkFrame();
      const openerFrame = mkFrame();

      openerFrame.frames[0] = mkFrame();

      frame.opener = openerFrame;
      frame.opener.top = frame.opener;
      frame.top = frame;

      broadcast("payload", {
        origin: "*",
        frames: [frame],
        limitBroadcastToFramesArray: true,
      });

      expect(frame.opener.top.frames[0].postMessage).not.toBeCalled();
    });

    it("should not throw if window.opener has access denied", () => {
      const frame = mkFrame();

      frame.top = frame;

      Object.defineProperty(frame, "opener", {
        get() {
          throw new Error("Access denied");
        },
      });

      expect(() => {
        broadcast("payload", {
          origin: "*",
          frames: [frame],
          limitBroadcastToFramesArray: false,
        });
      }).not.toThrowError("Access denied");
    });
  });
});
