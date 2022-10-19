import { broadcast } from "../../src/lib/broadcast";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function mkFrame(desiredOrigin?: string): Window {
  return {
    ...(window as Window),
    postMessage: jest.fn(),
    closed: false,
    origin: desiredOrigin || "someorigin",
  } as unknown as Window;
}

describe("broadcast", () => {
  it("should not throw exception when postMessage is denied", () => {
    const frame = mkFrame();
    frame.postMessage = jest.fn().mockImplementation(() => {
      throw new Error("Invalid calling object");
    });

    expect(() => {
      broadcast(frame, "payload", "*");
    }).not.toThrowError();
  });

  it("should postMessage to current frame", () => {
    const frame = mkFrame();

    broadcast(frame, "payload", "*");

    expect(frame.postMessage).toBeCalled();
  });

  it("should postMessage to current frame's child frames", () => {
    const frame = mkFrame();
    frame.frames[0] = mkFrame();

    broadcast(frame, "payload", "*");

    expect(frame.frames[0].postMessage).toBeCalled();
  });

  it("should only broadcast to target origin when limitBroadcastToOrigin set as true", () => {
    const limitBroadcastToOrigin = true;
    const happyPathOrigin = "https://some-target-origin.com";
    const frame = mkFrame("someorigin");
    const frameToSendTo = mkFrame(happyPathOrigin);
    const frameNoMessage = mkFrame("https://no-msg-for-you.com");

    /* window.frames is an "array-like" object. That basically means it is an object with keys that are integers.
       This means all child frames are like this: { 0: Window, 1: Window } etc.

       We have to have the parent frame set itself on `frames` so those are accessible.
     */
    frame[0] = frameToSendTo;
    frame[1] = frameNoMessage;
    Object.defineProperty(frame, "frames", {
      value: frame,
      writable: true,
    });

    broadcast(frame, "some-payload", happyPathOrigin, limitBroadcastToOrigin);

    expect(frameToSendTo.postMessage).toHaveBeenCalledTimes(1);
    expect(frameNoMessage.postMessage).toHaveBeenCalledTimes(0);
  });

  it("should broadcast broadly when using origin wildcard even with limitBroadcastToOrigin", () => {
    const limitBroadcastToOrigin = false;
    const happyPathOrigin = "https://some-target-origin.com";
    const frame = mkFrame("someorigin");
    const frameToSendTo = mkFrame(happyPathOrigin);
    const frameNoMessage = mkFrame("https://no-msg-for-you.com");

    frame[0] = frameToSendTo;
    frame[1] = frameNoMessage;
    Object.defineProperty(frame, "frames", {
      value: frame,
      writable: true,
    });

    broadcast(frame, "some-payload", "*", limitBroadcastToOrigin);

    expect(frameToSendTo.postMessage).toHaveBeenCalledTimes(1);
    expect(frameNoMessage.postMessage).toHaveBeenCalledTimes(1);
  });

  describe("to opener", () => {
    it("should postMessage to window.top.opener if it exists", () => {
      const frame = mkFrame();

      Object.defineProperty(frame, "top", {
        value: frame,
        writable: true,
      });

      frame.opener = mkFrame();
      frame.opener.top = frame.opener;

      broadcast(frame, "payload", "*");

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
      Object.defineProperty(frame, "top", {
        value: frame,
        writable: true,
      });

      broadcast(frame, "payload", "*");

      expect(frame.opener.top.postMessage).not.toBeCalled();
    });

    it("should not infinitely recurse if opener is itself", function (done) {
      const frame = mkFrame();

      jest.setTimeout(10);
      frame.opener = frame;
      Object.defineProperty(frame, "top", {
        value: frame,
        writable: true,
      });

      broadcast(frame, "payload", "*");

      // don't infinitely recurse
      done();
    });

    it("should not infinitely recurse if opener is parent", function (done) {
      const frame = mkFrame();
      const child = mkFrame();

      child.opener = frame;
      Object.defineProperty(child, "parent", {
        value: frame,
        writable: true,
      });
      Object.defineProperty(child, "top", {
        value: frame,
        writable: true,
      });
      Object.defineProperty(frame, "top", {
        value: frame,
        writable: true,
      });

      frame.frames[0] = child;
      broadcast(frame, "payload", "*");

      // don't infinitely recurse
      done();
    });

    it("should postMessage to the window.opener's child frames", () => {
      const frame = mkFrame();
      const openerFrame = mkFrame();

      openerFrame.frames[0] = mkFrame();

      frame.opener = openerFrame;
      frame.opener.top = frame.opener;
      Object.defineProperty(frame, "top", {
        value: frame,
        writable: true,
      });

      broadcast(frame, "payload", "*");

      expect(frame.opener.top.frames[0].postMessage).toBeCalled();
    });

    it("should not throw if window.opener has access denied", () => {
      const frame = mkFrame();

      Object.defineProperty(frame, "top", {
        value: frame,
        writable: true,
      });

      Object.defineProperty(frame, "opener", {
        get() {
          throw new Error("Access denied");
        },
      });

      expect(() => {
        broadcast(frame, "payload", "*");
      }).not.toThrowError("Access denied");
    });
  });
});
