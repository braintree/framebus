import { isntString } from "./is-not-string";

import type { FramebusOnHandler } from "./types";

export function subscriptionArgsInvalid(
  event: string,
  fn: FramebusOnHandler,
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
