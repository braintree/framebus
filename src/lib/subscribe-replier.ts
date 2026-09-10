import { Framebus } from "../framebus";
import generateUUID from "@braintree/uuid";

import type {
  FramebusSubscriberArg,
  FramebusSubscribeHandler,
  VerifyDomainMethod,
  IFrameOrWindowList,
} from "./";

export function subscribeReplier(
  fn: FramebusSubscribeHandler,
  origin: string,
  verifyDomain?: VerifyDomainMethod,
  targetFrames?: IFrameOrWindowList,
): string {
  const uuid = generateUUID();
  const bus = Framebus.target({ origin, verifyDomain, targetFrames });

  function replier(
    data: FramebusSubscriberArg,
    replyOriginHandler: FramebusSubscribeHandler,
  ): void {
    fn(data, replyOriginHandler);
    bus.off(uuid, replier);
  }

  bus.on(uuid, replier);

  return uuid;
}
