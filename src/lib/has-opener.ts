export default function hasOpener(frame: Window): boolean {
  if (frame.top !== frame) {
    return false;
  }
  if (frame.opener == null) {
    return false;
  }
  if (frame.opener === frame) {
    return false;
  }
  if (frame.opener.closed === true) {
    return false;
  }

  return true;
}
