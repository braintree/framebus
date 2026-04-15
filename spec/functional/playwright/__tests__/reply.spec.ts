import { test, expect } from "@playwright/test";

test.describe("Reply Events", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3099");
  });

  test("should only publish to targeted domains and print reply", async ({
    page,
  }) => {
    const frame3 = page.frame({ name: "frame3" });
    await frame3!.locator("#polo-text").fill("polo");

    const frame1 = page.frame({ name: "frame1" });
    const frame1Inner = frame1!
      .childFrames()
      .find((f) => f.name() === "frame1-inner");
    await frame1Inner!.locator("#marco-button").click();

    await expect(frame1Inner!.locator("p")).toHaveText("polo", {
      timeout: 10000,
    });

    await expect(page.locator("p")).toHaveCount(0);
    await expect(frame1!.locator("p")).toHaveCount(0);

    const frame2 = page.frame({ name: "frame2" });
    await expect(frame2!.locator("p")).toHaveCount(0);

    await expect(frame3!.locator("p")).toHaveText("are you there?");
  });
});
