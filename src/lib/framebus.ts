declare global {
  // for some reason, the Window constructor does not exist on the window object :/
  interface Window {
    Window: () => Window;
  }
}

import type {
  Framebus,
  FramebusPayload,
  SubscriberArg,
  SubscribeHandler,
  Subscriber,
} from "./types";

// eslint-disable-next-line prefer-const
let framebus: Framebus;

let isAttached = false;
let childWindows: Window[] = [];
let subscribers: Subscriber = {};
const prefix = "/*framebus*/";

/* eslint-disable no-mixed-operators */
function _uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}
/* eslint-enable no-mixed-operators */

function include(childWindow: Window): boolean {
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

function target(origin = "*"): Framebus {
  const targetedFramebus: Framebus = {
    ...framebus,
    _origin: origin,
  };

  return targetedFramebus;
}

function _hasOpener(frame: Window): boolean {
  if (frame.top !== frame) {
    return false;
  }
  if (frame.opener == null) {
    return false;
  }
  if (frame.opener === frame) {
    return false;
  }
  if (frame.opener.closed === true) {
    return false;
  }

  return true;
}

function _broadcast(frame: Window, payload: string, origin: string): void {
  let i = 0;
  let frameToBroadcastTo;

  try {
    frame.postMessage(payload, origin);

    if (_hasOpener(frame)) {
      _broadcast(frame.opener.top, payload, origin);
    }

    // previously, our max value was frame.frames.length
    // but frames.length inherits from window.length
    // which can be overwritten if a developer does
    // `var length = value;` outside of a function
    // scope, it'll prevent us from looping through
    // all the frames. With this, we loop through
    // until there are no longer any frames
    // eslint-disable-next-line no-cond-assign
    while ((frameToBroadcastTo = frame.frames[i])) {
      _broadcast(frameToBroadcastTo, payload, origin);
      i++;
    }
  } catch (_) {
    /* ignored */
  }
}

function _getOrigin(scope: Framebus): string {
  return (scope && scope._origin) || "*";
}

function _isntString(str: string): boolean {
  return typeof str !== "string";
}

function _subscribeReplier(fn: SubscribeHandler, origin: string): string {
  const uuid = _uuid();

  function replier(d: SubscriberArg, o: SubscribeHandler): void {
    fn(d, o);
    framebus.target(origin).unsubscribe(uuid, replier as SubscribeHandler);
  }

  framebus.target(origin).subscribe(uuid, replier as SubscribeHandler);

  return uuid;
}

function _packagePayload(
  event: string,
  origin: string,
  data?: SubscriberArg,
  reply?: SubscribeHandler
): string {
  let packaged;
  const payload: FramebusPayload = {
    event: event,
    origin: origin,
  };

  if (typeof reply === "function") {
    payload.reply = _subscribeReplier(reply, origin);
  }

  payload.eventData = data;

  try {
    packaged = prefix + JSON.stringify(payload);
  } catch (e) {
    throw new Error("Could not stringify event: " + e.message);
  }

  return packaged;
}

function publish(
  event: string,
  data?: SubscriberArg | SubscribeHandler,
  reply?: SubscribeHandler
): boolean {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const origin = _getOrigin(this); // eslint-disable-line no-invalid-this

  if (_isntString(event)) {
    return false;
  }
  if (_isntString(origin)) {
    return false;
  }

  if (typeof data === "function") {
    reply = data;
    data = undefined; // eslint-disable-line no-undefined
  }

  const payload = _packagePayload(event, origin, data, reply);
  if (!payload) {
    return false;
  }

  _broadcast(window.top || window.self, payload, origin);

  return true;
}

function _subscriptionArgsInvalid(
  event: string,
  fn: SubscribeHandler,
  origin: string
): boolean {
  if (_isntString(event)) {
    return true;
  }
  if (typeof fn !== "function") {
    return true;
  }
  if (_isntString(origin)) {
    return true;
  }

  return false;
}

function subscribe(event: string, fn: SubscribeHandler): boolean {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const origin = _getOrigin(this); // eslint-disable-line no-invalid-this

  if (_subscriptionArgsInvalid(event, fn, origin)) {
    return false;
  }

  subscribers[origin] = subscribers[origin] || {};
  subscribers[origin][event] = subscribers[origin][event] || [];
  subscribers[origin][event].push(fn);

  return true;
}

function unsubscribe(event: string, fn: SubscribeHandler): boolean {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const origin = _getOrigin(this); // eslint-disable-line no-invalid-this

  if (_subscriptionArgsInvalid(event, fn, origin)) {
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

function _unpackPayload(e: MessageEvent): FramebusPayload | false {
  let payload: FramebusPayload;

  if (e.data.slice(0, prefix.length) !== prefix) {
    return false;
  }

  try {
    payload = JSON.parse(e.data.slice(prefix.length));
  } catch (err) {
    return false;
  }

  if (payload.reply) {
    const replyOrigin = e.origin;
    const replySource = e.source as Window;
    const replyEvent = payload.reply as string;

    payload.reply = function reply(replyData: unknown): void {
      if (!replySource) {
        return;
      }

      const replyPayload = _packagePayload(
        replyEvent,
        replyOrigin,
        replyData as SubscriberArg
      );

      if (!replyPayload) {
        return;
      }

      replySource.postMessage(replyPayload, replyOrigin);
    };
  }
  return payload;
}

function _dispatch(
  origin: string,
  event: string,
  data: SubscriberArg,
  reply?: SubscribeHandler,
  e?: MessageEvent
): void {
  if (!subscribers[origin]) {
    return;
  }
  if (!subscribers[origin][event]) {
    return;
  }

  for (let i = 0; i < subscribers[origin][event].length; i++) {
    subscribers[origin][event][i].apply(e, [data, reply]);
  }
}

function _broadcastToChildWindows(
  payload: string,
  origin: string,
  source: Window
): void {
  for (let i = childWindows.length - 1; i >= 0; i--) {
    const childWindow = childWindows[i];

    if (childWindow.closed === true) {
      childWindows = childWindows.slice(i, 1);
    } else if (source !== childWindow) {
      _broadcast(childWindow.top, payload, origin);
    }
  }
}

function _onmessage(e: MessageEvent): void {
  if (_isntString(e.data)) {
    return;
  }

  const payload = _unpackPayload(e);
  if (!payload) {
    return;
  }

  const data = payload.eventData as SubscriberArg;
  const reply = payload.reply as SubscribeHandler;

  _dispatch("*", payload.event, data, reply, e);
  _dispatch(e.origin, payload.event, data, reply, e);
  _broadcastToChildWindows(e.data, payload.origin, e.source as Window);
}

function _attach(): void {
  if (isAttached) {
    return;
  }

  isAttached = true;
  window.addEventListener("message", _onmessage, false);
}

// removeIf(production)
function _detach(): void {
  isAttached = false;
  window.removeEventListener("message", _onmessage, false);

  childWindows = [];
  subscribers = {};
}
// endRemoveIf(production)

_attach();

framebus = {
  target: target,
  // removeIf(production)
  _packagePayload: _packagePayload,
  _unpackPayload: _unpackPayload,
  _attach: _attach,
  _detach: _detach,
  _dispatch: _dispatch,
  _broadcast: _broadcast,
  _subscribeReplier: _subscribeReplier,
  _subscriptionArgsInvalid: _subscriptionArgsInvalid,
  _onmessage: _onmessage,
  _uuid: _uuid,
  _getSubscribers: function (): Subscriber {
    return subscribers;
  },
  // endRemoveIf(production)
  include: include,
  publish: publish,
  pub: publish,
  trigger: publish,
  emit: publish,
  subscribe: subscribe,
  sub: subscribe,
  on: subscribe,
  unsubscribe: unsubscribe,
  unsub: unsubscribe,
  off: unsubscribe,
};

export = framebus;
