import { off } from ".";
import type { FramebusConfig } from "../framebus";

export function teardown(config: FramebusConfig): void {
  const { listeners } = config;
  if (config.isDestroyed) {
    return;
  }

  config.isDestroyed = true;

  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i];
    off(config, listener.eventName, listener.handler);
  }

  listeners.length = 0;
}
