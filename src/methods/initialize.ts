import { FramebusConfig, FramebusOptions } from "../framebus-config";
import { attach } from "../internal/attach";

export function initialize(options: FramebusOptions = {}): FramebusConfig {
  const framebusConfig = new FramebusConfig(options);

  attach();

  return framebusConfig;
}
