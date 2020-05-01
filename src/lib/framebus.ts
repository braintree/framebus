declare global {
  // for some reason, the Window constructor does not exist on the window object :/
  interface Window {
    Window: () => Window;
  }
}

type Framebus = {
  // TODO use actual shape of functions
  target: Function;
  // removeIf(production)
  _packagePayload: Function;
  _unpackPayload: Function;
  _attach: Function;
  _detach: Function;
  _dispatch: Function;
  _broadcast: Function;
  _subscribeReplier: Function;
  _subscriptionArgsInvalid: Function;
  _onmessage: Function;
  _uuid: Function;
  _getSubscribers: Function;
  // endRemoveIf(production)
  include: Function;
  publish: Function;
  pub: Function;
  trigger: Function;
  emit: Function;
  subscribe: Function;
  sub: Function;
  on: Function;
  unsubscribe: Function;
  unsub: Function;
  off: Function;
  _origin?: string;
};

type Payload = {
  data?: string;
  event: string;
  origin: string;
  replyEvent?: string;
  reply?: Function;
  args?: SubscriberArgs;
};
type PackedPayload = {
  data: string;
  origin: string;
  source: Window;
  reply: Function;
};
type UnpackedPayload = {};
type SubscriberArgs = any[];
type SubscribeHandler = (...args: SubscriberArgs) => void;
type Subscription = Record<string, SubscribeHandler[]>;
type Subscriber = Record<string, Subscription>;

// TODO no any!
let framebus: Framebus;

let isAttached = false;
let popups: Window[] = [];
let subscribers: Subscriber = {};
const prefix = "/*framebus*/";

function include(popup?: Window): boolean {
  if (popup == null) {
    return false;
  }
  if (popup.Window == null) {
    return false;
  }
  if (popup.constructor !== popup.Window) {
    return false;
  }

  popups.push(popup);

  return true;
}

function target(origin = "*"): Framebus {
  const targetedFramebus: Framebus = Object.assign({}, framebus, {
    _origin: origin,
  });

  return targetedFramebus;
}

function publish(event: string) {
  // @ts-ignore
  const origin = _getOrigin(this); // eslint-disable-line no-invalid-this

  if (_isntString(event)) {
    return false;
  }
  if (_isntString(origin)) {
    return false;
  }

  const args = Array.prototype.slice.call(arguments, 1);

  const payload = _packagePayload(event, args, origin);
  if (!payload) {
    return false;
  }

  _broadcast(window.top || window.self, payload, origin);

  return true;
}

function subscribe(event: string, fn: SubscribeHandler): boolean {
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

function _getOrigin(scope: Framebus) {
  return (scope && scope._origin) || "*";
}

function _isntString(str: string) {
  return typeof str !== "string";
}

function _packagePayload(
  event: string,
  args: SubscriberArgs,
  origin: string
): string {
  let packaged;
  const payload: Payload = {
    event: event,
    origin: origin,
  };
  const reply = args[args.length - 1];

  if (typeof reply === "function") {
    payload.replyEvent = _subscribeReplier(reply, origin);
    args = args.slice(0, -1);
  }

  payload.args = args;

  try {
    packaged = prefix + JSON.stringify(payload);
  } catch (e) {
    throw new Error("Could not stringify event: " + e.message);
  }

  return packaged;
}

function _unpackPayload(e: MessageEvent): Payload | false {
  let payload: Payload;
  let replyEvent: string;
  let replySource: Window;
  let replyOrigin: string;

  if (e.data.slice(0, prefix.length) !== prefix) {
    return false;
  }

  try {
    payload = JSON.parse(e.data.slice(prefix.length));
  } catch (err) {
    return false;
  }

  if (payload.replyEvent) {
    replyOrigin = e.origin;
    replySource = e.source as Window;
    replyEvent = payload.replyEvent;

    payload.reply = function reply(data: any) {
      // eslint-disable-line consistent-return
      let replyPayload;

      if (!replySource) {
        return;
      }

      replyPayload = _packagePayload(replyEvent, [data], replyOrigin);

      if (!replyPayload) {
        return;
      }

      replySource.postMessage(replyPayload, replyOrigin);
    };

    payload.args!.push(payload.reply);
  }

  return payload;
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

  popups = [];
  subscribers = {};
}
// endRemoveIf(production)

/* eslint-disable no-mixed-operators */
function _uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}
/* eslint-enable no-mixed-operators */

function _onmessage(e: MessageEvent): void {
  if (_isntString(e.data)) {
    return;
  }

  const payload = _unpackPayload(e);
  if (!payload) {
    return;
  }

  const args = payload.args as SubscriberArgs;

  _dispatch("*", payload.event, args, e);
  _dispatch(e.origin, payload.event, args, e);
  _broadcastPopups(e.data, payload.origin, e.source as Window);
}

function _dispatch(
  origin: string,
  event: string,
  args: SubscriberArgs,
  e: MessageEvent
) {
  if (!subscribers[origin]) {
    return;
  }
  if (!subscribers[origin][event]) {
    return;
  }

  for (let i = 0; i < subscribers[origin][event].length; i++) {
    subscribers[origin][event][i].apply(e, args);
  }
}

function _hasOpener(frame: Window) {
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

function _broadcast(frame: Window, payload: string, origin: string) {
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
    while ((frameToBroadcastTo = frame.frames[i])) {
      // eslint-disable-line no-cond-assign
      _broadcast(frameToBroadcastTo, payload, origin);
      i++;
    }
  } catch (_) {
    /* ignored */
  }
}

function _broadcastPopups(payload: string, origin: string, source: Window) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const popup = popups[i];

    if (popup.closed === true) {
      popups = popups.slice(i, 1);
    } else if (source !== popup) {
      _broadcast(popup.top, payload, origin);
    }
  }
}

function _subscribeReplier(fn: SubscribeHandler, origin: string): string {
  const uuid = _uuid();

  function replier(d: any, o: SubscribeHandler) {
    fn(d, o);
    framebus.target(origin).unsubscribe(uuid, replier);
  }

  framebus.target(origin).subscribe(uuid, replier);

  return uuid;
}

function _subscriptionArgsInvalid(
  event: string,
  fn: SubscribeHandler,
  origin: string
) {
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
  _getSubscribers: function () {
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
