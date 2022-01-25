import type { FramebusSubscriberArg, FramebusReplyHandler } from "../lib/types";
import type { FramebusConfig } from "../framebus";
import { isntString } from "../lib/is-not-string";
import { packagePayload } from "../lib/package-payload";
import { broadcast } from "../lib/broadcast";

export function emit(
  config: FramebusConfig,
  eventName: string,
  data?: FramebusSubscriberArg
): Promise<unknown> {
  const { isDestroyed, origin } = config;

  if (isDestroyed) {
    return Promise.reject(new Error("TODO"));
  }

  eventName = config.namespaceEvent(eventName);

  if (isntString(eventName)) {
    return Promise.reject(new Error("TODO"));
  }

  if (isntString(origin)) {
    return Promise.reject(new Error("TODO"));
  }

  return new Promise((resolve, reject) => {
    const payload = packagePayload(eventName, origin, data, resolve);
    if (!payload) {
      reject(new Error("TODO"));
    }

    broadcast(window.top || window.self, payload, origin);
  });
}
