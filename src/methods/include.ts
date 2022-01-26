import type { FramebusConfig } from "..";
import { childWindows } from "../lib/constants";

export function include(config: FramebusConfig, childWindow: Window): boolean {
  if (childWindow == null) {
    return false;
  }
  if (childWindow.Window == null) {
    return false;
  }
  if (childWindow.constructor !== childWindow.Window) {
    return false;
  }

  childWindows.push(childWindow);

  return true;
}
