import Framebus from "../framebus";
import generateUUID from "./uuid";

import type { SubscriberArg, SubscribeHandler } from "./types";

export default function subscribeReplier(
  fn: SubscribeHandler,
  origin: string
): string {
  const uuid = generateUUID();

  function replier(d: SubscriberArg, o: SubscribeHandler): void {
    fn(d, o);
    new Framebus().target(origin).off(uuid, replier as SubscribeHandler);
  }

  new Framebus().target(origin).on(uuid, replier as SubscribeHandler);

  return uuid;
}
