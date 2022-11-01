describe("targetFrames Events", () => {
  beforeEach(() => {
    browser.url("http://localhost:3099");
  });

  it("should only publish to targeted frames", () => {
    browser.switchToFrame(2);

    $("#send-to-parent").click();

    browser.switchToParentFrame();

    browser.waitUntil(
      () => {
        return $("p").getText() === "Special targetted message to only parent.";
      },
      {
        timeout: 1000,
        timeoutMsg: "expected p tag to have text",
      }
    );

    const indexReceived = $$("p").length;

    browser.switchToFrame(0);
    const frame1Received = $$("p").length;

    browser.switchToFrame(0);
    const innerframe1Received = $$("p").length;

    browser.switchToParentFrame();
    browser.switchToParentFrame();

    browser.switchToFrame(1);
    const frame2Received = $$("p").length;
    browser.switchToParentFrame();

    browser.switchToFrame(2);
    const frame3ReceivedQuestion = $$("p").length;

    expect(indexReceived).toBe(1);
    expect(innerframe1Received).toBe(0);
    expect(frame1Received).toBe(0);
    expect(frame2Received).toBe(0);
    expect(frame3ReceivedQuestion).toBe(0);
  });
});
