import { defineConfig } from "@playwright/test";
import CAPABILITIES from "./capabilities.json";
import {
  commonCaps,
  getBrowserStackEndpoint,
} from "./scripts/browserstack-constants";
import { webCapability } from "./types";

const createWebProjects = (platform: "windows" | "osx") => {
  const platformCapabilities = CAPABILITIES[platform] as webCapability[];
  return platformCapabilities.map((cap) => {
    const capabilities: Record<string, string> = {
      ...commonCaps,
      browser: cap.browserName,
      browser_Version: cap.browserVersion,
      os: cap.os,
      os_version: cap.osVersion,
    };

    return {
      name: `${platform}`,
      workers: platform === "osx" ? 4 : 3,
      testMatch: `**/*.spec.ts`,
      use: {
        name: `${cap.browserName}`,
        connectOptions: {
          wsEndpoint: getBrowserStackEndpoint(capabilities),
          timeout: 60000,
        },
        fullyParallel: true,
      },
    };
  });
};

export default defineConfig({
  globalSetup: require.resolve(
    "./scripts/playwright.browserstack.setup.ts",
  ),
  globalTeardown: require.resolve(
    "./scripts/playwright.browserstack.teardown.ts",
  ),

  projects: [
    ...createWebProjects("windows"),
    ...createWebProjects("osx"),
  ],
  timeout: 60000,
  retries: 0,
  webServer: {
    reuseExistingServer: true,
    command: "node ../../../bin/www",
    url: "http://localhost:3099",
    stdout: "ignore",
    stderr: "pipe",
  },
  use: {
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
  },
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
  expect: {
    timeout: 10000,
  },
});
