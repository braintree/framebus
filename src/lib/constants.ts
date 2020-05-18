import type { FramebusSubscriber } from "./types";

export const prefix = "/*framebus*/";
export const childWindows: Window[] = [];
export const subscribers: FramebusSubscriber = {};
