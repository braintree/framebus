import isntString from "./is-not-string";

import type { SubscribeHandler } from "./types";

export default function subscriptionArgsInvalid(
  event: string,
  fn: SubscribeHandler,
  origin: string
): boolean {
  if (isntString(event)) {
    return true;
  }
  if (typeof fn !== "function") {
    return true;
  }

  return isntString(origin);
}
