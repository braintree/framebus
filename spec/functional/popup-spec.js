describe("Popup Events", () => {
  it("should be able to receive events from opener frames", () => {
    const expected = "hello from frame3!";

    $("#open-popup").click();
    browser.switchWindow("popup");
    browser.waitUntil(
      () => {
        return $("body").getHTML() != null;
      },
      {
        timeout: 1000,
        timeoutMsg: "expected body to exist",
      }
    );

    browser.switchWindow("localhost:3099");

    browser.switchFrame(2);

    $("#popup-message").setValue(expected);
    $("#send").click();

    browser.switchWindow("popup");

    browser.waitUntil(
      () => {
        return $("p").getHTML !== "";
      },
      {
        timeout: 1000,
      }
    );
    $("p")
      .getText()
      .then((actual) => {
        expect($$("p").length).toBe(1);
        expect(actual).toBe(expected);
      });
  });

  it("should be able to send events to opener frames", () => {
    const expected = "hello from popup!";

    $("#open-popup").click();

    browser.switchWindow("popup");
    browser.waitUntil(
      () => {
        return $("body").getHTML() != null;
      },
      {
        timeout: 1000,
        timeoutMsg: "expected body to exist",
      }
    );

    $("#from-popup-message").setValue(expected);
    $("#send").click();

    browser.switchWindow("localhost:3099");
    browser.switchFrame(1);

    browser.waitUntil(
      () => {
        return $("p").getHTML !== "";
      },
      {
        timeout: 1000,
      }
    );
    $("p")
      .getText()
      .then((actual) => {
        expect($$("p").length).toBe(1);
        expect(actual).toContain(expected);
      });
  });

  it("should not double-receive events in popups", () => {
    const expected = "hello from popup!";

    $("#open-popup").click();

    browser.switchWindow("popup");
    browser.waitUntil(
      () => {
        return $("body").getHTML() != null;
      },
      {
        timeout: 1000,
        timeoutMsg: "expected body to exist",
      }
    );

    $("#from-popup-message").setValue(expected);
    $("#send").click();

    browser.switchWindow("localhost:3099");
    browser.switchFrame(1);

    browser.waitUntil(
      () => {
        return $("p").getHTML !== "";
      },
      {
        timeout: 1000,
      }
    );
    $("p")
      .getText()
      .then((actual) => {
        expect($$("p").length).toBe(1);
        expect(actual).not.toContain("FAILURE");
      });
  });

  it("should be able to receive messages from opener window", () => {
    const expected = "hello from opener!";

    $("#open-popup").click();
    browser.switchWindow("popup");
    browser.waitUntil(
      () => {
        return $("body").getHTML() != null;
      },
      {
        timeout: 1000,
        timeoutMsg: "expected body to exist",
      }
    );

    browser.switchWindow("localhost:3099");
    $("#from-top-message").setValue(expected);
    $("#send-from-top").click();

    browser.switchWindow("popup");
    browser.waitUntil(
      () => {
        return $("p").getHTML !== "";
      },
      {
        timeout: 1000,
      }
    );
    $("p")
      .getText()
      .then((actual) => {
        expect($$("p").length).toBe(1);
        expect(actual).not.toContain("FAILURE");
      });
  });
});
