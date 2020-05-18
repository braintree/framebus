import Framebus from "../framebus";
import generateUUID from "./uuid";

import type { FramebusSubscriberArg, FramebusSubscribeHandler } from "./types";

export default function subscribeReplier(
  fn: FramebusSubscribeHandler,
  origin: string
): string {
  const uuid = generateUUID();

  function replier(
    data: FramebusSubscriberArg,
    replyOriginHandler: FramebusSubscribeHandler
  ): void {
    fn(data, replyOriginHandler);
    new Framebus().target(origin).off(uuid, replier);
  }

  new Framebus().target(origin).on(uuid, replier);

  return uuid;
}
