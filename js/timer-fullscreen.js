/**
 * Full-screen timer view (timer only focus while chanting).
 */
window.JapaTimerFullscreen = {
  init(options) {
    this.overlay = document.getElementById("timer-fullscreen");
    this.displayEl = document.getElementById("timer-fullscreen-display");
    this.progressEl = document.getElementById("timer-fullscreen-progress");
    this.closeBtn = document.getElementById("timer-fullscreen-close");
    this.getElapsed = options.getElapsed;
    this.getProgressText = options.getProgressText;
    this.onStart = options.onStart;
    this.onStop = options.onStop;
    this.onReset = options.onReset;

    this.closeBtn.addEventListener("click", () => this.close());

    document
      .getElementById("timer-fs-start")
      .addEventListener("click", () => this.onStart());
    document
      .getElementById("timer-fs-stop")
      .addEventListener("click", () => this.onStop());
    document
      .getElementById("timer-fs-reset")
      .addEventListener("click", () => this.onReset());

    document.addEventListener("keydown", (event) => {
      if (!this.overlay.hidden && event.key === "Escape") {
        this.close();
      }
    });
  },

  sync() {
    if (!this.overlay || this.overlay.hidden || !this.displayEl) {
      return;
    }
    this.displayEl.textContent = window.JapaTime.formatElapsed(
      this.getElapsed()
    );
    this.progressEl.textContent = this.getProgressText();
  },

  open() {
    if (!this.overlay) {
      return;
    }
    this.overlay.hidden = false;
    document.body.classList.add("is-timer-fullscreen");
    this.sync();
    this.closeBtn.focus();
  },

  close() {
    if (!this.overlay) {
      return;
    }
    this.overlay.hidden = true;
    document.body.classList.remove("is-timer-fullscreen");
  },

  isOpen() {
    return !!(this.overlay && !this.overlay.hidden);
  },
};
