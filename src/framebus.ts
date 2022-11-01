import { isntString } from "./lib/is-not-string";
import { subscriptionArgsInvalid } from "./lib/subscription-args-invalid";
import { broadcast } from "./lib/broadcast";
import { packagePayload } from "./lib/package-payload";
import { sendMessage } from "./lib/send-message";

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
// this is a mixed type so that users can add iframes to the array
// before they have been added to the DOM (in which case, they
// would not have a contentWindow yet). When accessing these
// windows in Framebus, the targetFramesAsWindows private
// method should be used
type IFrameOrWindowList = Array<HTMLIFrameElement | Window>;
type FramebusOptions = {
  channel?: string;
  origin?: string;
  verifyDomain?: VerifyDomainMethod;
  targetFrames?: IFrameOrWindowList;
};

const DefaultPromise = (typeof window !== "undefined" &&
  window.Promise) as typeof Promise;

export class Framebus {
  origin: string;
  channel: string;
  targetFrames: IFrameOrWindowList;

  private verifyDomain?: VerifyDomainMethod;
  private isDestroyed: boolean;
  private listeners: Listener[];
  private hasAdditionalChecksForOnListeners: boolean;
  private limitBroadcastToFramesArray: boolean;

  constructor(options: FramebusOptions = {}) {
    this.origin = options.origin || "*";
    this.channel = options.channel || "";
    this.verifyDomain = options.verifyDomain;

    // if a targetFrames configuration is not passed in,
    // the default behavior is to broadcast the payload
    // to the top level window or to the frame itself.
    // By default, the broadcast function will loop through
    // all the known siblings and children of the window.
    // If a targetFrames array is passed, it will instead
    // only broadcast to those specified targetFrames
    this.targetFrames = options.targetFrames || [];
    this.limitBroadcastToFramesArray = Boolean(options.targetFrames);

    this.isDestroyed = false;
    this.listeners = [];

    this.hasAdditionalChecksForOnListeners = Boolean(
      this.verifyDomain || this.limitBroadcastToFramesArray
    );
  }

  static Promise = DefaultPromise;

  static setPromise(PromiseGlobal: typeof Framebus["Promise"]): void {
    Framebus.Promise = PromiseGlobal;
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

    if (this.limitBroadcastToFramesArray) {
      this.targetFrames.push(childWindow);
    }

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
    if (this.limitBroadcastToFramesArray) {
      this.targetFramesAsWindows().forEach((frame) => {
        sendMessage(frame, payload, origin);
      });
    } else {
      broadcast(payload, {
        origin,
        frame: window.top || window.self,
      });
    }

    return true;
  }

  emitAsPromise<T = void>(
    eventName: string,
    data?: FramebusSubscriberArg
  ): Promise<T> {
    return new Framebus.Promise((resolve, reject) => {
      const didAttachListener = this.emit(eventName, data, (payload) => {
        resolve(payload as T);
      });

      if (!didAttachListener) {
        reject(new Error(`Listener not added for "${eventName}"`));
      }
    });
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

    if (this.hasAdditionalChecksForOnListeners) {
      /* eslint-disable no-invalid-this, @typescript-eslint/ban-ts-comment */
      handler = function (...args) {
        // @ts-ignore
        if (!self.passesVerifyDomainCheck(this && this.origin)) {
          return;
        }

        // @ts-ignore
        if (!self.hasMatchingTargetFrame(this && this.source)) {
          return;
        }

        originalHandler(...args);
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

    if (this.verifyDomain) {
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

  private passesVerifyDomainCheck(origin: string): boolean {
    if (!this.verifyDomain) {
      // always pass this check if no verifyDomain option was set
      return true;
    }

    return this.checkOrigin(origin);
  }

  private targetFramesAsWindows(): Window[] {
    if (!this.limitBroadcastToFramesArray) {
      return [];
    }

    return this.targetFrames
      .map((frame) => {
        // we can't pull off the contentWindow
        // when the iframe is originally added
        // to the array, because if it is not
        // in the DOM at that time, it will have
        // a contentWindow of `null`
        if (frame instanceof HTMLIFrameElement) {
          return frame.contentWindow;
        }
        return frame;
      })
      .filter((win) => {
        // just in case an iframe element
        // was removed from the DOM
        // and the contentWindow property
        // is null
        return win;
      }) as Window[];
  }

  private hasMatchingTargetFrame(source: Window): boolean {
    if (!this.limitBroadcastToFramesArray) {
      // always pass this check if we aren't limiting to the target frames
      return true;
    }

    const matchingFrame = this.targetFramesAsWindows().find((frame) => {
      return frame === source;
    });

    return Boolean(matchingFrame);
  }

  private checkOrigin(postMessageOrigin: string) {
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
