import Framebus from "../framebus";
import generateUUID from "./uuid";

import type { SubscriberArg, SubscribeHandler } from "./types";

export default function subscribeReplier(
  fn: SubscribeHandler,
  origin: string
): string {
  const uuid = generateUUID();

  function replier(
    data: SubscriberArg,
    replyOriginHandler: SubscribeHandler
  ): void {
    fn(data, replyOriginHandler);
    new Framebus().target(origin).off(uuid, replier as SubscribeHandler);
  }

  new Framebus().target(origin).on(uuid, replier as SubscribeHandler);

  return uuid;
}
