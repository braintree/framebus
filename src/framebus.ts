let win: Window;

class Framebus {
  constructor(w: Window = window) {
    if (win) {
      return;
    }

    win = w;
  }
}
