import type { FramebusOnHandler } from "./internal/types";

type Listener = {
  eventName: string;
  handler: FramebusOnHandler;
  originalHandler: FramebusOnHandler;
};
type VerifyDomainMethod = (domain: string) => boolean;

export type FramebusOptions = {
  channel?: string;
  origin?: string;
  verifyDomain?: VerifyDomainMethod;
};

export class FramebusConfig {
  origin: string;
  channel: string;

  verifyDomain?: VerifyDomainMethod;
  shouldVerifyDomain: boolean;
  isDestroyed: boolean;
  listeners: Listener[];

  constructor(options: FramebusOptions = {}) {
    this.origin = options.origin || "*";
    this.channel = options.channel || "";
    this.verifyDomain = options.verifyDomain;
    this.shouldVerifyDomain = Boolean(this.verifyDomain);

    this.isDestroyed = false;
    this.listeners = [];
  }

  checkOrigin(postMessageOrigin: string) {
    let merchantHost;
    const a = document.createElement("a");

    a.href = location.href;

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

    if (this.shouldVerifyDomain && typeof this.verifyDomain === "function") {
      return this.verifyDomain(postMessageOrigin);
    }

    return true;
  }

  namespaceEvent(eventName: string): string {
    if (!this.channel) {
      return eventName;
    }

    return `${this.channel}:${eventName}`;
  }
}
