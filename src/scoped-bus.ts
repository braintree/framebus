import framebus from "./";
import { IsVerifiedDomainFunction, checkOrigin } from "./lib/check-origin";
import type { FramebusOnHandler } from "./lib/types";

type ScopedBusOptions = {
  channel: string;
  verifyDomainFunction?: IsVerifiedDomainFunction;
  parentPage?: string;
};

type Listener = {
  eventName: string;
  handler: FramebusOnHandler;
  originalHandler: FramebusOnHandler;
};

class ScopedBus {
  channel: string;
  parentPage?: string;
  private isDestroyed: boolean;
  private listeners: Listener[];
  private verifyDomainFunction?: IsVerifiedDomainFunction;

  constructor(options: ScopedBusOptions) {
    options = options || {};

    this.channel = options.channel;
    this.verifyDomainFunction = options.verifyDomainFunction;
    this.parentPage = options.parentPage;

    this.isDestroyed = false;

    this.listeners = [];
  }

  on(eventName: string, originalHandler: FramebusOnHandler): void {
    if (this.isDestroyed) {
      return;
    }

    const parentPage = this.parentPage;
    const verifyDomainFunction = this.verifyDomainFunction;
    let handler = originalHandler;

    if (this.parentPage) {
      handler = function (...args): void {
        /* eslint-disable no-invalid-this */
        /* eslint-disable @typescript-eslint/ban-ts-ignore */
        // @ts-ignore
        if (checkOrigin(this.origin, parentPage, verifyDomainFunction)) {
          // @ts-ignore
          originalHandler(...args);
        }
        /* eslint-enable no-invalid-this */
        /* eslint-enable @typescript-eslint/ban-ts-ignore */
      };
    }

    const namespacedEvent = this.namespaceEvent(eventName);

    /* eslint-disable-next-line @typescript-eslint/ban-ts-ignore */
    // @ts-ignore
    framebus.on(namespacedEvent, handler);

    this.listeners.push({
      eventName: eventName,
      handler: handler,
      originalHandler: originalHandler,
    });
  }

  emit(eventName: string, ...args: any[]): void {
    if (this.isDestroyed) {
      return;
    }

    eventName = this.namespaceEvent(eventName);

    framebus.emit(eventName, ...args);
  }

  off(eventName: string, originalHandler: FramebusOnHandler): void {
    let handler = originalHandler;

    if (this.isDestroyed) {
      return;
    }

    if (this.parentPage) {
      this.listeners.forEach((listener) => {
        if (listener.originalHandler === originalHandler) {
          handler = listener.handler;
        }
      });
    }

    this.offDirect(eventName, handler);
  }

  teardown(): void {
    this.listeners.forEach((listener) => {
      this.offDirect(listener.eventName, listener.handler);
    });

    this.listeners.length = 0;

    this.isDestroyed = true;
  }

  private offDirect(eventName: string, handler: FramebusOnHandler): void {
    if (this.isDestroyed) {
      return;
    }

    eventName = this.namespaceEvent(eventName);

    framebus.off(eventName, handler);
  }

  private namespaceEvent(eventName: string): string {
    return `Bus:${this.channel}:${eventName}`;
  }
}

export = ScopedBus;
