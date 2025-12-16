import { $, $$ } from "@wdio/globals";

describe("Popup Events", () => {
  beforeEach(async () => {
    await browser.url("http://localhost:3099");
  });

  afterEach(async () => {
    await browser.reloadSession();
  });

  it("should be able to receive events from opener frames", async () => {
    const expected = "hello from frame3!";
    const iframe = await $("iframe[name='frame3']");

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

    await browser.switchFrame(iframe);

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

    const paragraphs = await $$("p");
    expect(paragraphs.length).toBe(1);

    const actual = await $("p").getText();
    expect(actual).toBe(expected);
  });

  it("should be able to send events to opener frames", async () => {
    const expected = "hello from popup!";
    const iframe = await $("iframe[name='frame2']");

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
    await browser.switchFrame(iframe);

    await browser.waitUntil(
      () => {
        return $("p").getHTML !== "";
      },
      {
        timeout: 1000,
      }
    );

    const paragraphs = await $$("p");
    expect(paragraphs.length).toBe(1);

    const actual = await $("p").getText();
    expect(actual).toContain(expected);
  });

  it("should not double-receive events in popups", async () => {
    const expected = "hello from popup!";
    const iframe = await $("iframe[name='frame2']");

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
    await browser.switchFrame(iframe);

    await browser.waitUntil(
      () => {
        return $("p").getHTML !== "";
      },
      {
        timeout: 1000,
      }
    );

    const paragraphs = await $$("p");
    expect(paragraphs.length).toBe(1);

    const actual = await $("p").getText();
    expect(actual).not.toContain("FAILURE");
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
