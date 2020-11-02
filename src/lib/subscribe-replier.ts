import { Framebus } from "../framebus";
import generateUUID from "@braintree/uuid";

import type { FramebusSubscriberArg, FramebusSubscribeHandler } from "./types";

export function subscribeReplier(
  fn: FramebusSubscribeHandler,
  origin: string
): string {
  const uuid = generateUUID();

  function replier(
    data: FramebusSubscriberArg,
    replyOriginHandler: FramebusSubscribeHandler
  ): void {
    fn(data, replyOriginHandler);
    Framebus.target({
      origin,
    }).off(uuid, replier);
  }

  Framebus.target({
    origin,
  }).on(uuid, replier);

  return uuid;
}
