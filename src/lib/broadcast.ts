import { hasOpener } from "./has-opener";

// this method is mostly to reduce the number of console.error messages
// when the origin is set to anything other than the default (*)
function shouldBroadcast(frameToBroadcastTo: Window, origin: string): boolean {
  // this is the default origin, so we can short circuit any logic around this
  // if the origin is * and just tell it to broadcast
  if (origin === "*") {
    return true;
  }

  // this is wrapped in a try catch because if the domain is different than
  // the domain of the frame issuing the postMessage, we will not be able
  // to access the origin attribute and it will throw instead
  // in that case, we _must_ broadcast to it even if the origin does not match,
  // resulting in an ugly (but benign) console.error
  try {
    return frameToBroadcastTo.origin === origin;
  } catch (err) {
    return true;
  }
}

export function broadcast(
  frame: Window,
  payload: string,
  origin: string
): void {
  let i = 0;
  let frameToBroadcastTo;

  try {
    if (shouldBroadcast(frame, origin)) {
      frame.postMessage(payload, origin);
    }

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
