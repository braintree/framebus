import { checkOrigin } from "../../src/lib/check-origin";

describe("check-origin", () => {
  describe("for the same domain", () => {
    it("accepts if post message origin equals the current url", () => {
      const parentOrigin = "https://example.com:3443";
      const actual = checkOrigin("https://example.com:3443", parentOrigin);

      expect(actual).toBe(true);
    });

    it("ignores 443 port for https domains", () => {
      // does not ignore it for http domains
      expect(checkOrigin("http://example.com", "http://example.com:443")).toBe(
        false
      );
      expect(
        checkOrigin("https://example.com", "https://example.com:443")
      ).toBe(true);
    });

    it("ignores 80 port for http domains", () => {
      // does not ignore it for https domains
      expect(checkOrigin("https://example.com", "https://example.com:80")).toBe(
        false
      );
      expect(checkOrigin("http://example.com", "http://example.com:80")).toBe(
        true
      );
    });

    it("returns false if it doesn't quite equal a passed parent origin", () => {
      const parentOrigin = "https://example.com:3000";
      const actual = checkOrigin("https://example.com:3443", parentOrigin);

      expect(actual).toBe(false);
    });

    it("allows an override to be passed to make a final check", () => {
      expect(
        checkOrigin(
          "https://example.com:3443",
          "https://another-page",
          (domain: string) => {
            return domain.indexOf("https://example.com") > -1;
          }
        )
      ).toBe(true);

      expect(
        checkOrigin(
          "https://example.com:3443",
          "https://another-page",
          (domain: string) => {
            return domain === "none-of-these";
          }
        )
      ).toBe(false);
    });
  });
});
