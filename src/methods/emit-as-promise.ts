import { emit } from "./emit";
import type { FramebusConfig } from "../framebus-config";
import type { FramebusSubscriberArg } from "../lib/types";

export function emitAsPromise<T = unknown>(
  config: FramebusConfig,
  eventName: string,
  data?: FramebusSubscriberArg
): Promise<T> {
  return new Promise((resolve, reject) => {
    const didAttachListener = emit(config, eventName, data, (payload) => {
      resolve(payload as T);
    });

    if (!didAttachListener) {
      reject(new Error(`Listener not added for "${eventName}"`));
    }
  });
}
