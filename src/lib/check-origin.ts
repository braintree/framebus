export type IsVerifiedDomainFunction = (domain: string) => boolean;

export function checkOrigin(
  postMessageOrigin: string,
  currentUrl: string,
  isVerifiedDomain?: IsVerifiedDomainFunction
): boolean {
  const a = document.createElement("a");
  let merchantHost;

  a.href = currentUrl;

  if (a.protocol === "https:") {
    merchantHost = a.host.replace(/:443$/, "");
  } else if (a.protocol === "http:") {
    merchantHost = a.host.replace(/:80$/, "");
  } else {
    merchantHost = a.host;
  }

  const merchantOrigin = a.protocol + "//" + merchantHost;

  if (merchantOrigin === postMessageOrigin) {
    return true;
  }

  if (!isVerifiedDomain) {
    return false;
  }

  return isVerifiedDomain(postMessageOrigin);
}
