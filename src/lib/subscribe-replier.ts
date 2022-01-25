import { FramebusConfig } from "../framebus";
import { on, off } from "../methods";
import generateUUID from "@braintree/uuid";

import type { FramebusSubscriberArg, FramebusSubscribeHandler } from "./types";

export function subscribeReplier(
  fn: FramebusSubscribeHandler,
  origin: string
): string {
  const uuid = generateUUID();

  const config = new FramebusConfig({
    origin,
  });

  function replier(
    data: FramebusSubscriberArg,
    replyOriginHandler: FramebusSubscribeHandler
  ): void {
    fn(data, replyOriginHandler);
    off(config, uuid, replier);
  }

  on(config, uuid, replier);

  return uuid;
}
