describe("Reply Events", function () {
  beforeEach(function () {
    browser.url("http://localhost:3099");
  });

  it("should only publish to targeted domains and print reply", function () {
    browser.switchToFrame(2);

    $("#polo-text").setValue("polo");

    browser.switchToParentFrame();

    browser.switchToFrame(0);
    browser.switchToFrame(0);

    $("#marco-button").click();

    browser.waitUntil(
      function () {
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

    browser.switchToFrame(0);
    const frame1Received = $$("p").length;
    browser.switchToParentFrame();

    browser.switchToFrame(1);
    const frame2Received = $$("p").length;
    browser.switchToParentFrame();

    browser.switchToFrame(2);
    const frame3ReceivedQuestion = $("p").getText();

    expect(indexReceived).toBe(0);
    expect(frame1Received).toBe(0);
    expect(frame2Received).toBe(0);
    expect(frame3ReceivedQuestion).toBe("are you there?");
  });
});
