import { subscribers } from "./";

import type { FramebusSubscriberArg, FramebusSubscribeHandler } from "./";

export function dispatch(
  origin: string,
  event: string,
  data?: FramebusSubscriberArg,
  reply?: FramebusSubscribeHandler,
  e?: MessageEvent
): void {
  if (!subscribers[origin]) {
    return;
  }
  if (!subscribers[origin][event]) {
    return;
  }

  const args: [
    (FramebusSubscriberArg | FramebusSubscribeHandler)?,
    FramebusSubscribeHandler?
  ] = [];

  if (data) {
    args.push(data as FramebusSubscriberArg);
  }

  if (reply) {
    args.push(reply as FramebusSubscribeHandler);
  }

  for (let i = 0; i < subscribers[origin][event].length; i++) {
    subscribers[origin][event][i].apply(e, args);
  }
}
