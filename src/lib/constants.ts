import type { FramebusOnHandler, FramebusSubscriber } from "./";

export const prefix = "/*framebus*/";
export const childWindows: Window[] = [];
export const subscribers: FramebusSubscriber = {};
export const originalToInternalHandlerMap: Map<
  FramebusOnHandler,
  FramebusOnHandler
> = new Map();
