import { test, expect } from "@playwright/test";

test.describe("targetFrames Events", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3099");
  });

  test("should only publish to targeted frames", async ({ page }) => {
    const frame3 = page.frame({ name: "frame3" });
    if (!frame3) throw new Error('Frame "frame3" not found');
    await frame3.locator("#send-to-parent").click();

    await expect(page.locator("p")).toHaveText(
      "Special targetted message to only parent.",
      { timeout: 1000 },
    );
    await expect(page.locator("p")).toHaveCount(1);

    const frame1 = page.frame({ name: "frame1" });
    if (!frame1) throw new Error('Frame "frame1" not found');
    await expect(frame1.locator("p")).toHaveCount(0);

    const frame1Inner = frame1
      .childFrames()
      .find((f) => f.name() === "frame1-inner");
    if (!frame1Inner) throw new Error('Frame "frame1-inner" not found');
    await expect(frame1Inner.locator("p")).toHaveCount(0);

    const frame2 = page.frame({ name: "frame2" });
    if (!frame2) throw new Error('Frame "frame2" not found');
    await expect(frame2.locator("p")).toHaveCount(0);

    await expect(frame3.locator("p")).toHaveCount(0);
  });
});
