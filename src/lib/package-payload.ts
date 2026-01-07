import { subscribeReplier, prefix } from "./";

import type {
  FramebusPayload,
  FramebusSubscriberArg,
  FramebusSubscribeHandler,
} from "./types";

export function packagePayload(
  event: string,
  origin: string,
  data?: FramebusSubscriberArg,
  reply?: FramebusSubscribeHandler,
): string {
  let packaged;
  const payload: FramebusPayload = {
    event: event,
    origin: origin,
  };

  if (typeof reply === "function") {
    payload.reply = subscribeReplier(reply, origin);
  }

  payload.eventData = data;

  try {
    packaged = prefix + JSON.stringify(payload);
  } catch (e) {
    throw new Error(`Could not stringify event: ${(e as Error).message}`);
  }

  return packaged;
}
