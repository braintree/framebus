import Framebus = require("../framebus");
import { uuid as generateUUID } from "./uuid";

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
    new Framebus().target(origin).off(uuid, replier);
  }

  new Framebus().target(origin).on(uuid, replier);

  return uuid;
}
