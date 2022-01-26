import { childWindows, subscribers } from "../lib/constants";
import { FramebusConfig } from "../framebus";
import { isntString } from "../lib/is-not-string";
import { packagePayload } from "../lib/package-payload";
import { broadcast } from "../lib/broadcast";

import type {
  FramebusSubscriberArg,
  FramebusSubscribeHandler,
  FramebusOnHandler,
  FramebusReplyHandler,
} from "../lib/types";

export { on } from "./on";
export { off } from "./off";
export { emit } from "./emit";
export { initialize } from "./initialize";
export { teardown } from "./teardown";
export { include } from "./include";



// export function target(options?: FramebusOptions): FramebusConfig {
//   return FramebusConfig.target(options);
// }


// export function emitAsPromise<T = void>(
//   eventName: string,
//   data?: FramebusSubscriberArg
// ): Promise<T> {
//   return new Framebus.Promise((resolve, reject) => {
//     const didAttachListener = this.emit(eventName, data, (payload) => {
//       resolve(payload as T);
//     });

//     if (!didAttachListener) {
//       reject(new Error(`Listener not added for "${eventName}"`));
//     }
//   });
// }