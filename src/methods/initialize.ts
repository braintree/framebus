import { FramebusConfig, FramebusOptions } from "../framebus";
import { attach } from "../lib/attach";

export function initialize(options: FramebusOptions = {}): FramebusConfig {
  const framebusConfig = new FramebusConfig(options);

  attach();

  return framebusConfig;
}
