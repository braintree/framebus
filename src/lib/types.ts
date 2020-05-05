declare global {
  // for some reason, the Window constructor does not exist on the window object :/
  interface Window {
    Window: () => Window;
  }
}

type UnsubscribeMethod = (event: string, fn: SubscribeHandler) => boolean;
type SubscribeMethod = (event: string, fn: SubscribeHandler) => boolean;
type PublishMethod = (
  event: string,
  data?: SubscriberArg | SubscribeHandler,
  reply?: SubscribeHandler
) => boolean;
type ReplyFunction = (...args: unknown[]) => void;

export type FramebusEvent = {
  data: string;
};

export type FramebusPayload = {
  data?: string;
  event: string;
  origin: string;
  reply?: string | ReplyFunction;
  eventData?: SubscriberArg;
};
export type SubscriberArg = Record<string, unknown>;
export type SubscribeHandler = (
  data?: SubscriberArg,
  reply?: SubscribeHandler
) => void;
type Subscription = Record<string, SubscribeHandler[]>;
export type Subscriber = Record<string, Subscription>;
