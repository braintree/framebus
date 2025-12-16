describe("Popup Events", () => {
  it.only("should be able to receive events from opener frames", async () => {
    const expected = "hello from frame3!";
    await $("#open-popup").click();
    await browser.switchWindow("popup");
    
await browser.waitUntil(
      () => {
        return $("body").getHTML() != null;
      },
      {
        timeout: 1000,
        timeoutMsg: "expected body to exist",
      }
    );
    await browser.switchWindow("localhost:3099");

    await browser.switchFrame(2);

    await $("#popup-message").setValue(expected);
    await $("#send").click();

    await browser.switchWindow("popup");

    await browser.waitUntil(
      () => {
        return $("p").getHTML !== "";
      },
      {
        timeout: 1000,
      }
    );
    const text = await $("p")
      .getText();

    const actual = await $$("p");

    expect (actual.length).toBe(1);
    expect(text).toBe(expected);
  });

  it("should be able to send events to opener frames", async () => {
    const expected = "hello from popup!";

    await $("#open-popup").click();

    await browser.switchWindow("popup");
    await browser.waitUntil(
      () => {
        return $("body").getHTML() != null;
      },
      {
        timeout: 1000,
        timeoutMsg: "expected body to exist",
      }
    );

    await $("#from-popup-message").setValue(expected);
    await $("#send").click();

    await browser.switchWindow("localhost:3099");
    await browser.switchFrame(1);

    await browser.waitUntil(
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

  it("should not double-receive events in popups", async () => {
    const expected = "hello from popup!";

    await $("#open-popup").click();

    await browser.switchWindow("popup");
    await browser.waitUntil(
      () => {
        return $("body").getHTML() != null;
      },
      {
        timeout: 1000,
        timeoutMsg: "expected body to exist",
      }
    );

    await $("#from-popup-message").setValue(expected);
    await $("#send").click();

    await browser.switchWindow("localhost:3099");
    await browser.switchFrame(1);

    await browser.waitUntil(
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

  it("should be able to receive messages from opener window", async () => {
    const expected = "hello from opener!";

    await $("#open-popup").click();
    await browser.switchWindow("popup");
    await browser.waitUntil(
      () => {
        return $("body").getHTML() != null;
      },
      {
        timeout: 1000,
        timeoutMsg: "expected body to exist",
      }
    );

    await browser.switchWindow("localhost:3099");
    await $("#from-top-message").setValue(expected);
    await $("#send-from-top").click();

    await browser.switchWindow("popup");
    await browser.waitUntil(
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
