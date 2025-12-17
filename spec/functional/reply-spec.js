import { $, $$ } from "@wdio/globals";

describe("Reply Events", () => {
  beforeEach(async () => {
    await browser.url("http://localhost:3099");
  });

  it("should only publish to targeted domains and print reply", async () => {
    const iframe3 = await $("iframe[name='frame3']");
    await browser.switchFrame(iframe3);

    await $("#polo-text").setValue("polo");

    await browser.switchToParentFrame();
    const iframe1 = await $("iframe");

    await browser.switchFrame(iframe1);
    await browser.switchFrame(iframe1);

    await $("#marco-button").click();

    await browser.waitUntil(
      async () => {
        const text = await $("p").getText();
        return text === "polo";
      },
      {
        timeout: 10000,
        timeoutMsg: "expected p tag to have text",
      }
    );

    await browser.switchToParentFrame();
    await browser.switchToParentFrame();

    const indexReceived = await $$("p").length;
    expect(indexReceived).toBe(0);

    await browser.switchFrame(await $("iframe[name='frame1']"));
    const frame1Received = await $$("p").length;
    expect(frame1Received).toBe(0);

    await browser.switchToParentFrame();
    await browser.switchFrame(await $("iframe[name='frame2']"));
    const frame2Received = await $$("p").length;
    expect(frame2Received).toBe(0);

    await browser.switchToParentFrame();
    await browser.switchFrame(await $("iframe[name='frame3']"));
    const frame3ReceivedQuestion = await $("p").getText();
    expect(frame3ReceivedQuestion).toBe("are you there?");
  });
});
