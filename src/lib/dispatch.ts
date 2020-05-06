import { subscribers } from "./constants";

import type { SubscriberArg, SubscribeHandler } from "./types";

export default function dispatch(
  origin: string,
  event: string,
  data?: SubscriberArg,
  reply?: SubscribeHandler,
  e?: MessageEvent
): void {
  if (!subscribers[origin]) {
    return;
  }
  if (!subscribers[origin][event]) {
    return;
  }

  const args: [(SubscriberArg | SubscribeHandler)?, SubscribeHandler?] = [];

  if (data) {
    args.push(data as SubscriberArg);
  }

  if (reply) {
    args.push(reply as SubscribeHandler);
  }

  for (let i = 0; i < subscribers[origin][event].length; i++) {
    subscribers[origin][event][i].apply(e, args);
  }
}
