declare global {
  // for some reason, the Window constructor does not exist on the window object :/
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  eventData?: FramebusSubscriberArg;
};
export type FramebusSubscriberArg = Record<string, unknown>;
export type FramebusSubscribeHandler = (
  data?: FramebusSubscriberArg | FramebusSubscribeHandler,
  reply?: FramebusSubscribeHandler,
) => void;
type FramebusSubscription = Record<string, FramebusSubscribeHandler[]>;
export type FramebusSubscriber = Record<string, FramebusSubscription>;

export type FramebusReplyHandler = (data: unknown) => void;
export type FramebusOnHandler = (
  data: FramebusSubscriberArg,
  reply: FramebusReplyHandler,
) => void;
