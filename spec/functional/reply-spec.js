describe("Reply Events", () => {
  it("should only publish to targeted domains and print reply", () => {
    browser.switchFrame(2);

    $("#polo-text").setValue("polo");

    browser.switchToParentFrame();

    browser.switchFrame(0);
    browser.switchFrame(0);

    $("#marco-button").click();

    browser.waitUntil(
      () => {
        return $("p").getText() === "polo";
      },
      {
        timeout: 1000,
        timeoutMsg: "expected p tag to have text",
      }
    );

    browser.switchToParentFrame();
    browser.switchToParentFrame();

    const indexReceived = $$("p").length;

    browser.switchFrame(0);
    const frame1Received = $$("p").length;
    browser.switchToParentFrame();

    browser.switchFrame(1);
    const frame2Received = $$("p").length;
    browser.switchToParentFrame();

    browser.switchFrame(2);
    const frame3ReceivedQuestion = $("p").getText();

    Promise.all([
      indexReceived,
      frame1Received,
      frame2Received,
      frame3ReceivedQuestion,
    ]).then(() => {
      expect(indexReceived).toBe(0);
      expect(frame1Received).toBe(0);
      expect(frame2Received).toBe(0);
      expect(frame3ReceivedQuestion).toBe("are you there?");
    });
  });
});
