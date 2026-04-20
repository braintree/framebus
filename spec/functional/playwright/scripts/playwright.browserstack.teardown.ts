/* eslint-disable no-console */
import { bsLocal } from "./browserstack-constants";

async function globalTeardown() {
  if (bsLocal && bsLocal.isRunning()) {
    await new Promise<void>((resolve) => {
      bsLocal.stop(() => {
        console.log("BrowserStack Local stopped");
        resolve();
      });
    });
  }
}

export default globalTeardown;
