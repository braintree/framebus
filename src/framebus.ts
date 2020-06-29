import { isntString } from "./lib/is-not-string";
import { subscriptionArgsInvalid } from "./lib/subscription-args-invalid";
import { broadcast } from "./lib/broadcast";
import { packagePayload } from "./lib/package-payload";

import type {
  FramebusSubscriberArg,
  FramebusSubscribeHandler,
  FramebusOnHandler,
  FramebusReplyHandler,
} from "./lib/types";

import { childWindows, subscribers } from "./lib/constants";

export = class Framebus {
  origin: string;

  constructor(origin = "*") {
    this.origin = origin;
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

  target(origin = "*"): Framebus {
    return new Framebus(origin);
  }

  emit(
    event: string,
    data?: FramebusSubscriberArg | FramebusReplyHandler,
    reply?: FramebusReplyHandler
  ): boolean {
    const origin = this.origin;

    if (isntString(event)) {
      return false;
    }

    if (isntString(origin)) {
      return false;
    }

    if (typeof data === "function") {
      reply = data;
      data = undefined; // eslint-disable-line no-undefined
    }

    const payload = packagePayload(event, origin, data, reply);
    if (!payload) {
      return false;
    }

    broadcast(window.top || window.self, payload, origin);

    return true;
  }

  on(event: string, fn: FramebusOnHandler): boolean {
    const origin = this.origin;

    if (subscriptionArgsInvalid(event, fn, origin)) {
      return false;
    }

    subscribers[origin] = subscribers[origin] || {};
    subscribers[origin][event] = subscribers[origin][event] || [];
    subscribers[origin][event].push(fn as FramebusSubscribeHandler);

    return true;
  }

  off(event: string, fn: FramebusOnHandler): boolean {
    const origin = this.origin;

    if (subscriptionArgsInvalid(event, fn, origin)) {
      return false;
    }

    const subscriberList = subscribers[origin] && subscribers[origin][event];
    if (!subscriberList) {
      return false;
    }

    for (let i = 0; i < subscriberList.length; i++) {
      if (subscriberList[i] === fn) {
        subscriberList.splice(i, 1);

        return true;
      }
    }

    return false;
  }
};
