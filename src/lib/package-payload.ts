import { subscribeReplier, prefix } from "./";

import type {
  FramebusPayload,
  FramebusSubscriberArg,
  FramebusSubscribeHandler,
  VerifyDomainMethod,
  IFrameOrWindowList,
} from "./types";

export function packagePayload(
  event: string,
  origin: string,
  data?: FramebusSubscriberArg,
  reply?: FramebusSubscribeHandler,
  verifyDomain?: VerifyDomainMethod,
  targetFrames?: IFrameOrWindowList,
): string {
  let packaged;
  const payload: FramebusPayload = {
    event: event,
    origin: origin,
  };

  if (typeof reply === "function") {
    payload.reply = subscribeReplier(reply, origin, verifyDomain, targetFrames);
  }

  payload.eventData = data;

  try {
    packaged = prefix + JSON.stringify(payload);
  } catch (e) {
    throw new Error(`Could not stringify event: ${(e as Error).message}`);
  }

  return packaged;
}
