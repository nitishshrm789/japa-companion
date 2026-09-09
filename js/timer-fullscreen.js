/**
 * Full-screen timer view (timer only focus while chanting).
 * Can re-bind to main Clock or Extra Rounds stopwatch.
 */
window.JapaTimerFullscreen = {
  init(options) {
    this.overlay = document.getElementById("timer-fullscreen");
    this.displayEl = document.getElementById("timer-fullscreen-display");
    this.progressEl = document.getElementById("timer-fullscreen-progress");
    this.closeBtn = document.getElementById("timer-fullscreen-close");
    this.bind(options);

    this.closeBtn.addEventListener("click", () => this.close());

    document
      .getElementById("timer-fs-start")
      .addEventListener("click", () => {
        if (typeof this.onStart === "function") {
          this.onStart();
        }
      });
    document
      .getElementById("timer-fs-stop")
      .addEventListener("click", () => {
        if (typeof this.onStop === "function") {
          this.onStop();
        }
      });
    document
      .getElementById("timer-fs-reset")
      .addEventListener("click", () => {
        if (typeof this.onReset === "function") {
          this.onReset();
        }
      });

    document.addEventListener("keydown", (event) => {
      if (!this.overlay.hidden && event.key === "Escape") {
        this.close();
      }
    });
  },

  bind(options) {
    this.getElapsed = options.getElapsed;
    this.getProgressText = options.getProgressText;
    this.onStart = options.onStart;
    this.onStop = options.onStop;
    this.onReset = options.onReset;
  },

  sync() {
    if (!this.overlay || this.overlay.hidden || !this.displayEl) {
      return;
    }
    if (typeof this.getElapsed !== "function") {
      return;
    }
    this.displayEl.textContent = window.JapaTime.formatElapsed(
      this.getElapsed()
    );
    this.progressEl.textContent =
      typeof this.getProgressText === "function"
        ? this.getProgressText()
        : "";
  },

  open(options) {
    if (!this.overlay) {
      return;
    }
    if (options) {
      this.bind(options);
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
