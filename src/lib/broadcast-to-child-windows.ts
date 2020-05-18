import broadcast from "./broadcast";
import { childWindows } from "./constants";

export default function broadcastToChildWindows(
  payload: string,
  origin: string,
  source: Window
): void {
  for (let i = childWindows.length - 1; i >= 0; i--) {
    const childWindow = childWindows[i];

    if (childWindow.closed) {
      childWindows.splice(i, 1);
    } else if (source !== childWindow) {
      broadcast(childWindow.top, payload, origin);
    }
  }
}
