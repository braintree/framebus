import { hasOpener } from "./has-opener";

type BroadcastOptions = {
  origin: string;
  frames: Window[];
  limitBroadcastToFramesArray: boolean;
};

export function broadcast(payload: string, options: BroadcastOptions): void {
  let i = 0;
  let frameToBroadcastTo;

  const { origin, frames, limitBroadcastToFramesArray } = options;

  const frame = frames[0];
  // frames.forEach((frame) => {
  try {
    frame.postMessage(payload, origin);

    // if (limitBroadcastToFramesArray) {
    //   return;
    // }

    if (hasOpener(frame) && frame.opener.top !== window.top) {
      broadcast(payload, {
        origin,
        frames: [frame.opener.top],
        limitBroadcastToFramesArray,
      });
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
      broadcast(payload, {
        origin,
        frames: [frameToBroadcastTo],
        limitBroadcastToFramesArray,
      });
      i++;
    }
  } catch (_) {
    /* ignored */
  }
  // });
}
