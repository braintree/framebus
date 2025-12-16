import { $, $$ } from "@wdio/globals";

describe("targetFrames Events", () => {
  beforeEach(async () => {
    await browser.url("http://localhost:3099");
  });

  it("should only publish to targeted frames", async () => {
    const iframe3 = await $("iframe[name='frame3']");
    await browser.switchFrame(iframe3);

    await $("#send-to-parent").click();

    await browser.switchToParentFrame();

    await browser.waitUntil(
      async () => {
        const text = await $("p").getText();
        return text === "Special targetted message to only parent.";
      },
      {
        timeout: 1000,
        timeoutMsg: "expected p tag to have text",
      }
    );

    const indexReceived = await $$("p").length;
    expect(indexReceived).toBe(1);

    const iframe1 = await $("iframe");

    await browser.switchFrame(iframe1);
    const frame1Received = await $$("p").length;
    expect(frame1Received).toBe(0);

    await browser.switchFrame(iframe1);
    const innerframe1Received = await $$("p").length;
    expect(innerframe1Received).toBe(0);

    await browser.switchToParentFrame();
    await browser.switchToParentFrame();

    const iframe2 = await $("iframe[name='frame2']");
    await browser.switchFrame(iframe2);
    const frame2Received = await $$("p").length;
    expect(frame2Received).toBe(0);

    await browser.switchToParentFrame();
    await browser.switchFrame(iframe3);
    const frame3ReceivedQuestion = await $$("p").length;
    expect(frame3ReceivedQuestion).toBe(0);
  });
});
