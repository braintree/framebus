import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({
  path: path.resolve(__dirname, "../../../../.env"),
  quiet: true,
});

export const BUILD_NUMBER =
  process.env.BUILD_NUMBER || process.env.BROWSERSTACK_BUILD_ID || "local";
export const LOCAL_IDENTIFIER =
  process.env.BROWSERSTACK_LOCAL_IDENTIFIER ||
  `playwright-local-${BUILD_NUMBER}`;

export const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME;
export const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;

import BrowserStackLocal from "browserstack-local";

export const bsLocal = new BrowserStackLocal.Local();

export function getBrowserStackEndpoint(caps: Record<string, string>): string {
  return `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
    JSON.stringify(caps),
  )}`;
}

export const BS_LOCAL_ARGS = {
  key: BROWSERSTACK_ACCESS_KEY,
  localIdentifier: LOCAL_IDENTIFIER,
  verbose: true,
  forcelocal: true,
  force: true,
};

export function validateBrowserStackEnv(): void {
  if (!BROWSERSTACK_USERNAME || !BROWSERSTACK_ACCESS_KEY) {
    throw new Error(
      "Missing BROWSERSTACK_USERNAME or BROWSERSTACK_ACCESS_KEY environment variables. " +
        "Please ensure these are set in your .env file or environment.",
    );
  }
}

export const commonCaps = {
  "browserstack.username": BROWSERSTACK_USERNAME,
  "browserstack.accessKey": BROWSERSTACK_ACCESS_KEY,
  "browserstack.consoleLogs": "errors",
  "browserstack.debug": "true",
  "browserstack.local": "true",
  "browserstack.localIdentifier": LOCAL_IDENTIFIER,
  "browserstack.networkLogs": "true",
  "browserstack.playwrightLogs": "true",
  "browserstack.idleTimeout": "300",
  "client.playwrightVersion": "1.57.0",
  build: `Framebus Integration Tests #${BUILD_NUMBER}`,
} as Record<string, string>;
