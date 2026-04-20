/* eslint-disable no-console */
import {
  bsLocal,
  BS_LOCAL_ARGS,
  LOCAL_IDENTIFIER,
  validateBrowserStackEnv,
} from "./browserstack-constants";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

async function globalSetup() {
  validateBrowserStackEnv();

  console.log("Starting BrowserStack Local tunnel...");
  console.log(`Using localIdentifier: ${LOCAL_IDENTIFIER}`);

  await new Promise<void>((resolve, reject) => {
    bsLocal.start(BS_LOCAL_ARGS, (err?: Error) => {
      if (err) {
        console.error("Error starting BrowserStack Local:", err.message);
        reject(err);
      } else {
        console.log("BrowserStack Local tunnel started successfully");
        resolve();
      }
    });
  });

  console.log("Waiting for BrowserStack to register the tunnel...");
  await sleep(10000);

  console.log(`Tunnel isRunning: ${bsLocal.isRunning()}`);
  console.log(
    `BrowserStack Local connected (localIdentifier=${LOCAL_IDENTIFIER})`,
  );
}

export default globalSetup;
