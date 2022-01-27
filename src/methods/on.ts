import type {
  FramebusOnHandler,
  FramebusSubscribeHandler,
} from "../internal/types";
import type { FramebusConfig } from "../framebus-config";
import { subscriptionArgsInvalid } from "../internal/subscription-args-invalid";
import { subscribers } from "../internal/constants";

export function on(
  config: FramebusConfig,
  eventName: string,
  originalHandler: FramebusOnHandler
): boolean {
  const { isDestroyed, origin, shouldVerifyDomain } = config;

  if (isDestroyed) {
    return false;
  }

  let handler = originalHandler;

  eventName = config.namespaceEvent(eventName);

  if (subscriptionArgsInvalid(eventName, handler, origin)) {
    return false;
  }

  if (shouldVerifyDomain) {
    handler = function (...args) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (config.checkOrigin(this && this.origin)) {
        originalHandler(...args);
      }
    };
  }

  config.listeners.push({
    eventName,
    handler,
    originalHandler,
  });

  subscribers[origin] = subscribers[origin] || {};
  subscribers[origin][eventName] = subscribers[origin][eventName] || [];
  subscribers[origin][eventName].push(handler as FramebusSubscribeHandler);

  return true;
}
