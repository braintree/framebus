import { isntString } from "./lib/is-not-string";
import { subscriptionArgsInvalid } from "./lib/subscription-args-invalid";
import { broadcast } from "./lib/broadcast";
import { packagePayload } from "./lib/package-payload";

import { childWindows, subscribers } from "./lib/constants";

import type {
  FramebusSubscriberArg,
  FramebusSubscribeHandler,
  FramebusOnHandler,
  FramebusReplyHandler,
} from "./lib/types";
type Listener = {
  eventName: string;
  handler: FramebusOnHandler;
  originalHandler: FramebusOnHandler;
};
type VerifyDomainMethod = (domain: string) => boolean;
type FramebusOptions = {
  channel?: string;
  origin?: string;
  parentUrl?: string;
  verifyDomain?: VerifyDomainMethod;
};

export class Framebus {
  origin: string;
  channel: string;
  parentUrl: string;

  private verifyDomain?: VerifyDomainMethod;
  private isDestroyed: boolean;
  private listeners: Listener[];

  constructor(options: FramebusOptions = {}) {
    this.origin = options.origin || "*";
    this.channel = options.channel || "";
    this.parentUrl = options.parentUrl || "";
    this.verifyDomain = options.verifyDomain;

    this.isDestroyed = false;
    this.listeners = [];
  }

  static target(options?: FramebusOptions): Framebus {
    return new Framebus(options);
  }

  include(childWindow: Window): boolean {
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

  target(options?: FramebusOptions): Framebus {
    return Framebus.target(options);
  }

  emit(
    eventName: string,
    data?: FramebusSubscriberArg | FramebusReplyHandler,
    reply?: FramebusReplyHandler
  ): boolean {
    if (this.isDestroyed) {
      return false;
    }

    const origin = this.origin;
    eventName = this.namespaceEvent(eventName);

    if (isntString(eventName)) {
      return false;
    }

    if (isntString(origin)) {
      return false;
    }

    if (typeof data === "function") {
      reply = data;
      data = undefined; // eslint-disable-line no-undefined
    }

    const payload = packagePayload(eventName, origin, data, reply);
    if (!payload) {
      return false;
    }

    broadcast(window.top || window.self, payload, origin);

    return true;
  }

  on(eventName: string, originalHandler: FramebusOnHandler): boolean {
    if (this.isDestroyed) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const origin = this.origin;
    let handler = originalHandler;

    eventName = this.namespaceEvent(eventName);

    if (subscriptionArgsInvalid(eventName, handler, origin)) {
      return false;
    }

    if (this.parentUrl) {
      /* eslint-disable no-invalid-this, @typescript-eslint/ban-ts-comment */
      handler = function (...args) {
        // @ts-ignore
        if (self.checkOrigin(this && this.origin)) {
          originalHandler(...args);
        }
      };
      /* eslint-enable no-invalid-this, @typescript-eslint/ban-ts-comment */
    }

    this.listeners.push({
      eventName,
      handler,
      originalHandler,
    });

    subscribers[origin] = subscribers[origin] || {};
    subscribers[origin][eventName] = subscribers[origin][eventName] || [];
    subscribers[origin][eventName].push(handler as FramebusSubscribeHandler);

    return true;
  }

  off(eventName: string, originalHandler: FramebusOnHandler): boolean {
    let handler = originalHandler;

    if (this.isDestroyed) {
      return false;
    }

    if (this.parentUrl) {
      for (let i = 0; i < this.listeners.length; i++) {
        const listener = this.listeners[i];

        if (listener.originalHandler === originalHandler) {
          handler = listener.handler;
        }
      }
    }

    eventName = this.namespaceEvent(eventName);
    const origin = this.origin;

    if (subscriptionArgsInvalid(eventName, handler, origin)) {
      return false;
    }

    const subscriberList =
      subscribers[origin] && subscribers[origin][eventName];
    if (!subscriberList) {
      return false;
    }

    for (let i = 0; i < subscriberList.length; i++) {
      if (subscriberList[i] === handler) {
        subscriberList.splice(i, 1);

        return true;
      }
    }

    return false;
  }

  teardown(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    for (let i = 0; i < this.listeners.length; i++) {
      const listener = this.listeners[i];
      this.off(listener.eventName, listener.handler);
    }

    this.listeners.length = 0;
  }

  private checkOrigin(postMessageOrigin: string) {
    let merchantHost;
    const a = document.createElement("a");

    a.href = this.parentUrl;

    if (a.protocol === "https:") {
      merchantHost = a.host.replace(/:443$/, "");
    } else if (a.protocol === "http:") {
      merchantHost = a.host.replace(/:80$/, "");
    } else {
      merchantHost = a.host;
    }

    const merchantOrigin = a.protocol + "//" + merchantHost;

    if (merchantOrigin === postMessageOrigin) {
      return true;
    }

    if (this.verifyDomain) {
      return this.verifyDomain(postMessageOrigin);
    }

    return true;
  }

  private namespaceEvent(eventName: string): string {
    if (!this.channel) {
      return eventName;
    }

    return `${this.channel}:${eventName}`;
  }
}
