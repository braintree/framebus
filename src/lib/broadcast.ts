import { hasOpener } from "./has-opener";

export function broadcast(
  frame: Window,
  payload: string,
  origin: string
): void {
  let i = 0;
  let frameToBroadcastTo;

  try {
    frame.postMessage(payload, origin);

    if (hasOpener(frame) && frame.opener.top !== window.top) {
      broadcast(frame.opener.top, payload, origin);
    }

    // previously, our max value was frame.frames.length
    // but frames.length inherits from window.length
    // which can be overwritten if a developer does
    // `var length = value;` outside of a function
    // scope, it'll prevent us from looping through
    // all the frames. With this, we loop through
    // until there are no longer any frames
    // eslint-disable-next-line no-cond-assign
    while ((frameToBroadcastTo = frame.frames[i])) {
      broadcast(frameToBroadcastTo, payload, origin);
      i++;
    }
  } catch (_) {
    /* ignored */
  }
}
