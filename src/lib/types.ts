type UnsubscribeMethod = (event: string, fn: SubscribeHandler) => boolean;
type SubscribeMethod = (event: string, fn: SubscribeHandler) => boolean;
type PublishMethod = (event: string, ...args: SubscriberArgs) => boolean;

export type Framebus = {
  // removeIf(production)
  _attach: () => void;
  _broadcast: (frame: Window, payload: string, origin: string) => void;
  _detach: () => void;
  _dispatch: (
    origin: string,
    event: string,
    args: SubscriberArgs,
    e?: MessageEvent
  ) => void;
  _getSubscribers: () => Subscriber;
  _onmessage: (e: MessageEvent) => void;
  _packagePayload: (
    event: string,
    args: SubscriberArgs,
    origin: string
  ) => string;
  _subscribeReplier: (fn: SubscribeHandler, origin: string) => string;
  _subscriptionArgsInvalid: (
    event: string,
    fn: SubscribeHandler,
    origin: string
  ) => boolean;
  _unpackPayload: (e: MessageEvent) => FramebusPayload | false;
  _uuid: () => string;
  // endRemoveIf(production)
  include: (popup?: Window) => boolean;

  emit: PublishMethod;
  pub: PublishMethod;
  publish: PublishMethod;
  trigger: PublishMethod;

  target: (origin: string) => Framebus;

  on: SubscribeMethod;
  sub: SubscribeMethod;
  subscribe: SubscribeMethod;

  off: UnsubscribeMethod;
  unsub: UnsubscribeMethod;
  unsubscribe: UnsubscribeMethod;

  _origin?: string;
};

export type FramebusEvent = {
  data: string;
};

export type FramebusPayload = {
  data?: string;
  event: string;
  origin: string;
  replyEvent?: string;
  reply?: (...args: unknown[]) => void;
  args?: SubscriberArgs;
};
export type SubscriberArgs = any[];
export type SubscribeHandler = (...args: SubscriberArgs) => void;
type Subscription = Record<string, SubscribeHandler[]>;
export type Subscriber = Record<string, Subscription>;
