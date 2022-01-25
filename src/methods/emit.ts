import type { FramebusSubscriberArg, FramebusReplyHandler } from "../lib/types";
import type { FramebusConfig } from "../framebus";
import { isntString } from "../lib/is-not-string";
import { packagePayload } from "../lib/package-payload";
import { broadcast } from "../lib/broadcast";

export function emit(
  config: FramebusConfig,
  eventName: string,
  data?: FramebusSubscriberArg | FramebusReplyHandler,
  reply?: FramebusReplyHandler
): boolean {
  const { isDestroyed, origin } = config;

  if (isDestroyed) {
    return false;
  }

  eventName = config.namespaceEvent(eventName);

  if (isntString(eventName)) {
    return false;
  }

  if (isntString(origin)) {
    return false;
  }

  if (typeof data === "function") {
    reply = data;
    data = undefined; // eslint-disable-line no-undefined
  }

  const payload = packagePayload(eventName, origin, data, reply);
  if (!payload) {
    return false;
  }

  broadcast(window.top || window.self, payload, origin);

  return true;
}
