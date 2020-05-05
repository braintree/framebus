import subscribeReplier from "./subscribe-replier";
import { prefix } from "./constants";

import type { FramebusPayload, SubscriberArg, SubscribeHandler } from "./types";

export default function packagePayload(
  event: string,
  origin: string,
  data?: SubscriberArg,
  reply?: SubscribeHandler
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
    throw new Error("Could not stringify event: " + e.message);
  }

  return packaged;
}
