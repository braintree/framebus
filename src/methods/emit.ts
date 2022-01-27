import type {
  FramebusSubscriberArg,
  FramebusReplyHandler,
} from "../internal/types";
import type { FramebusConfig } from "../framebus-config";
import { isntString } from "../internal/is-not-string";
import { packagePayload } from "../internal/package-payload";
import { broadcast } from "../internal/broadcast";

export function emit<T = unknown>(
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

  const payload = packagePayload(eventName, origin, data, (replyData) => {
    if (reply) {
      reply(replyData as T);
    }
  });
  if (!payload) {
    return false;
  }

  broadcast(window.top || window.self, payload, origin);

  return true;
}
