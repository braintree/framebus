import type { FramebusOnHandler } from "../lib/types";
import type { FramebusConfig } from "../framebus-config";
import { subscriptionArgsInvalid } from "../lib/subscription-args-invalid";
import { subscribers } from "../lib/constants";

export function off(
  config: FramebusConfig,
  eventName: string,
  originalHandler: FramebusOnHandler
): boolean {
  const { isDestroyed, shouldVerifyDomain, listeners, origin } = config;
  let handler = originalHandler;

  if (isDestroyed) {
    return false;
  }

  if (shouldVerifyDomain) {
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];

      if (listener.originalHandler === originalHandler) {
        handler = listener.handler;
      }
    }
  }

  eventName = config.namespaceEvent(eventName);

  if (subscriptionArgsInvalid(eventName, handler, origin)) {
    return false;
  }

  const subscriberList = subscribers[origin] && subscribers[origin][eventName];
  if (!subscriberList) {
    return false;
  }

  for (let i = 0; i < subscriberList.length; i++) {
    if (subscriberList[i] === handler) {
      subscriberList.splice(i, 1);

      return true;
    }
  }

  return false;
}
