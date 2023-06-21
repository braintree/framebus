import type { FramebusSubscriberArg, FramebusSubscribeHandler } from "./";

import {
  isntString,
  unpackPayload,
  dispatch,
  broadcastToChildWindows,
} from "./";

export function onMessage(e: MessageEvent): void {
  if (isntString(e.data)) {
    return;
  }

  const payload = unpackPayload(e);
  if (!payload) {
    return;
  }

  const data = payload.eventData as FramebusSubscriberArg;
  const reply = payload.reply as FramebusSubscribeHandler;

  dispatch("*", payload.event, data, reply, e);
  dispatch(e.origin, payload.event, data, reply, e);
  broadcastToChildWindows(e.data, payload.origin, e.source as Window);
}
