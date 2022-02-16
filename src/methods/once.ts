import type { FramebusOnHandler } from "../internal/types";
import type { FramebusConfig } from "../framebus-config";
import { on } from "./on";
import { off } from "./off";

export function once(
  config: FramebusConfig,
  eventName: string,
  originalHandler: FramebusOnHandler
): boolean {
  const handler: FramebusOnHandler = (...args) => {
    off(config, eventName, handler);
    originalHandler(...args);
  };

  return on(config, eventName, handler);
}
