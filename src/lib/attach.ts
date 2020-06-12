import onmessage from "./message";

let isAttached = false;

export function attach(): void {
  if (isAttached || typeof window === "undefined") {
    return;
  }

  isAttached = true;
  window.addEventListener("message", onmessage, false);
}

// removeIf(production)
export function detach(): void {
  isAttached = false;
  window.removeEventListener("message", onmessage, false);
}
// endRemoveIf(production)
