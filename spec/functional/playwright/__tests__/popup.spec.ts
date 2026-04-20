import { test, expect, Frame } from "@playwright/test";

function getFrame(frames: (Frame | null)[], name: string): Frame {
  const frame = frames.find((f) => f && f.name() === name);
  if (!frame) throw new Error(`Frame "${name}" not found`);
  return frame;
}

test.describe("Popup Events", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3099");
  });

  test("should be able to receive events from opener frames", async ({
    page,
    context,
  }) => {
    const expected = "hello from frame3!";

    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      page.click("#open-popup"),
    ]);
    await popup.waitForLoadState();

    const frame3 = getFrame(page.frames(), "frame3");
    await frame3.locator("#popup-message").fill(expected);
    await frame3.locator("#send").click();

    await popup.waitForSelector("p");
    await expect(popup.locator("p")).toHaveCount(1);
    await expect(popup.locator("p")).toHaveText(expected);
  });

  test("should be able to send events to opener frames", async ({
    page,
    context,
  }) => {
    const expected = "hello from popup!";

    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      page.click("#open-popup"),
    ]);
    await popup.waitForLoadState();

    await popup.locator("#from-popup-message").fill(expected);
    await popup.locator("#send").click();

    const frame2 = getFrame(page.frames(), "frame2");
    await frame2.waitForSelector("p");
    await expect(frame2.locator("p")).toHaveCount(1);
    await expect(frame2.locator("p")).toContainText(expected);
  });

  test("should not double-receive events in popups", async ({
    page,
    context,
  }) => {
    const expected = "hello from popup!";

    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      page.click("#open-popup"),
    ]);
    await popup.waitForLoadState();

    await popup.locator("#from-popup-message").fill(expected);
    await popup.locator("#send").click();

    const frame2 = getFrame(page.frames(), "frame2");
    await frame2.waitForSelector("p");
    await expect(frame2.locator("p")).toHaveCount(1);
    await expect(frame2.locator("p")).not.toContainText("FAILURE");
  });

  test("should be able to receive messages from opener window", async ({
    page,
    context,
  }) => {
    const expected = "hello from opener!";

    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      page.click("#open-popup"),
    ]);
    await popup.waitForLoadState();

    await page.locator("#from-top-message").fill(expected);
    await page.locator("#send-from-top").click();

    await popup.waitForSelector("p");
    await expect(popup.locator("p")).toHaveCount(1);
    await expect(popup.locator("p")).not.toContainText("FAILURE");
  });
});
