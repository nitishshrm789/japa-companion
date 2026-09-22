/**
 * Full-screen Digital Counter view — bead count, clock, and controls.
 */
window.JapaDigitalCounterFullscreen = {
  init(options) {
    if (this.ready) {
      this.bind(options);
      return;
    }

    this.overlay = document.getElementById("digital-fullscreen");
    this.beadBtn = document.getElementById("digital-fs-bead");
    this.beadValue = document.getElementById("digital-fs-bead-value");
    this.timerDisplay = document.getElementById("digital-fs-timer");
    this.progressEl = document.getElementById("digital-fs-progress");
    this.closeBtn = document.getElementById("digital-fullscreen-close");
    this.bind(options);

    this.closeBtn.addEventListener(
      "click",
      function () {
        this.close();
      }.bind(this)
    );

    this.beadBtn.addEventListener(
      "pointerdown",
      function () {
        this.beadBtn.classList.add("is-pressed");
      }.bind(this)
    );
    this.beadBtn.addEventListener(
      "pointerup",
      function () {
        this.beadBtn.classList.remove("is-pressed");
      }.bind(this)
    );
    this.beadBtn.addEventListener(
      "pointercancel",
      function () {
        this.beadBtn.classList.remove("is-pressed");
      }.bind(this)
    );
    this.beadBtn.addEventListener(
      "pointerleave",
      function () {
        this.beadBtn.classList.remove("is-pressed");
      }.bind(this)
    );
    this.beadBtn.addEventListener(
      "click",
      function () {
        if (typeof this.onBeadPress === "function") {
          this.onBeadPress();
        }
      }.bind(this)
    );

    document
      .getElementById("digital-fs-start")
      .addEventListener(
        "click",
        function () {
          if (typeof this.onStart === "function") {
            this.onStart();
          }
        }.bind(this)
      );
    document
      .getElementById("digital-fs-stop")
      .addEventListener(
        "click",
        function () {
          if (typeof this.onStop === "function") {
            this.onStop();
          }
        }.bind(this)
      );
    document
      .getElementById("digital-fs-reset")
      .addEventListener(
        "click",
        function () {
          if (typeof this.onReset === "function") {
            this.onReset();
          }
        }.bind(this)
      );

    document.addEventListener(
      "keydown",
      function (event) {
        if (this.isOpen() && event.key === "Escape") {
          this.close();
        }
      }.bind(this)
    );

    this.ready = true;
  },

  bind(options) {
    this.getBeadCount = options.getBeadCount;
    this.getElapsed = options.getElapsed;
    this.getProgressText = options.getProgressText;
    this.onBeadPress = options.onBeadPress;
    this.onStart = options.onStart;
    this.onStop = options.onStop;
    this.onReset = options.onReset;
  },

  sync() {
    if (!this.overlay || this.overlay.hidden) {
      return;
    }
    if (typeof this.getBeadCount === "function") {
      this.beadValue.textContent = String(this.getBeadCount() || 0);
    }
    if (typeof this.getElapsed === "function") {
      this.timerDisplay.textContent = window.JapaTime.formatElapsed(
        this.getElapsed()
      );
    }
    if (typeof this.getProgressText === "function") {
      this.progressEl.textContent = this.getProgressText();
    }
  },

  open(options) {
    if (!this.overlay) {
      return;
    }
    if (options) {
      this.bind(options);
    }
    this.overlay.hidden = false;
    document.body.classList.add("is-digital-fullscreen");
    this.sync();
    this.closeBtn.focus();
  },

  close() {
    if (!this.overlay) {
      return;
    }
    this.overlay.hidden = true;
    document.body.classList.remove("is-digital-fullscreen");
  },

  isOpen() {
    return !!(this.overlay && !this.overlay.hidden);
  },
};
