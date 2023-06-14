import { onMessage } from "./";

let isAttached = false;

export function attach(): void {
  if (isAttached || typeof window === "undefined") {
    return;
  }

  isAttached = true;
  window.addEventListener("message", onMessage, false);
}

// removeIf(production)
export function detach(): void {
  isAttached = false;
  window.removeEventListener("message", onMessage, false);
}
// endRemoveIf(production)
