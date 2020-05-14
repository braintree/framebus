declare global {
  // for some reason, the Window constructor does not exist on the window object :/
  interface Window {
    Window: () => Window;
  }
}

type ReplyFunction = (...args: unknown[]) => void;

export type FramebusPayload = {
  data?: string;
  event: string;
  origin: string;
  reply?: string | ReplyFunction;
  eventData?: SubscriberArg;
};
export type SubscriberArg = Record<string, unknown>;
export type SubscribeHandler = (
  data?: SubscriberArg | SubscribeHandler,
  reply?: SubscribeHandler
) => void;
type Subscription = Record<string, SubscribeHandler[]>;
export type Subscriber = Record<string, Subscription>;
