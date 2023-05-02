import { isntString } from "./";

import type { FramebusOnHandler } from "./";

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
