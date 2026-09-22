/**
 * Digital Counter — 108-bead circular counter + independent timer / rounds.
 */
window.JapaDigitalCounterPanel = {
  BEAD_MAX: 108,
  MAX_ROUNDS: 16,

  render(rootElement) {
    this.root = rootElement;
    this.ensureDom();
    this.ensureEngine();
    this.restoreSession();
    this.ready = true;
    this.persist();
    this.syncUi();
  },

  ensureDom() {
    this.beadBtn = document.getElementById("digital-bead");
    this.beadValue = document.getElementById("digital-bead-value");
    this.timerPanel = document.getElementById("digital-timer-panel");
    this.timerDisplay = document.getElementById("digital-timer-display");
    this.roundProgress = document.getElementById("digital-round-progress");
    this.roundsListEl = document.getElementById("digital-rounds-list");
    this.roundsEmptyEl = document.getElementById("digital-rounds-empty");
  },

  fullscreenOptions() {
    const self = this;
    return {
      getBeadCount: function () {
        return self.beadCount || 0;
      },
      getElapsed: function () {
        return self.stopwatch ? self.stopwatch.getElapsed() : 0;
      },
      getProgressText: function () {
        return self.roundProgress ? self.roundProgress.textContent : "";
      },
      onBeadPress: function () {
        self.onBeadPress();
      },
      onStart: function () {
        self.startTimer();
      },
      onStop: function () {
        self.stopTimer();
      },
      onReset: function () {
        self.resetBeadAndTimer();
      },
    };
  },

  ensureEngine() {
    const self = this;

    if (!this.stopwatch) {
      this.stopwatch = window.JapaStopwatch.create(function onTick(elapsedMs) {
        const text = window.JapaTime.formatElapsed(elapsedMs);
        if (self.timerDisplay) {
          self.timerDisplay.textContent = text;
        }
        if (
          window.JapaDigitalCounterFullscreen &&
          window.JapaDigitalCounterFullscreen.isOpen()
        ) {
          window.JapaDigitalCounterFullscreen.sync();
        }
      });
    }

    if (!this.roundsList) {
      this.roundsList = window.JapaRounds.create(
        this.roundsListEl,
        this.roundsEmptyEl,
        function onChange() {
          self.syncProgress();
          self.persist();
        },
        { startNumber: 1, maxRounds: self.MAX_ROUNDS }
      );
    }

    if (window.JapaDigitalCounterFullscreen && !window.JapaDigitalCounterFullscreen.ready) {
      window.JapaDigitalCounterFullscreen.init(this.fullscreenOptions());
    }

    if (this.listenersBound) {
      return;
    }
    this.listenersBound = true;

    this.beadBtn.addEventListener("pointerdown", function () {
      self.beadBtn.classList.add("is-pressed");
    });
    this.beadBtn.addEventListener("pointerup", function () {
      self.beadBtn.classList.remove("is-pressed");
    });
    this.beadBtn.addEventListener("pointercancel", function () {
      self.beadBtn.classList.remove("is-pressed");
    });
    this.beadBtn.addEventListener("pointerleave", function () {
      self.beadBtn.classList.remove("is-pressed");
    });
    this.beadBtn.addEventListener("click", function () {
      self.onBeadPress();
    });

    if (this.timerPanel) {
      this.timerPanel.addEventListener("click", function () {
        self.openFullscreen();
      });
      this.timerPanel.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          self.openFullscreen();
        }
      });
    }

    document
      .getElementById("btn-digital-start")
      .addEventListener("click", function () {
        self.startTimer();
      });
    document
      .getElementById("btn-digital-stop")
      .addEventListener("click", function () {
        self.stopTimer();
      });
    document
      .getElementById("btn-digital-reset")
      .addEventListener("click", function () {
        self.resetBeadAndTimer();
      });
    document
      .getElementById("btn-digital-clear")
      .addEventListener("click", function (event) {
        event.stopPropagation();
        self.clearAll();
      });
    document
      .getElementById("btn-digital-save-day")
      .addEventListener("click", function () {
        self.saveDay();
      });
  },

  openFullscreen() {
    if (!window.JapaDigitalCounterFullscreen) {
      return;
    }
    window.JapaDigitalCounterFullscreen.init(this.fullscreenOptions());
    window.JapaDigitalCounterFullscreen.open(this.fullscreenOptions());
  },

  restoreSession() {
    if (typeof this.beadCount !== "number") {
      this.beadCount = 0;
    }

    const saved = window.JapaDigitalSessionStore.load();
    if (!saved) {
      if (!this.sessionLoaded) {
        this.beadCount = 0;
        this.stopwatch.setElapsed(0);
        this.roundsList.setRounds([]);
        this.sessionLoaded = true;
      }
      return;
    }

    // Only hydrate from storage once per page load so mid-session
    // re-renders (tab switches) do not clobber live timer state.
    if (this.sessionLoaded) {
      return;
    }
    this.sessionLoaded = true;

    this.beadCount = saved.beadCount || 0;
    this.roundsList.setRounds(saved.rounds || []);

    if (saved.running && saved.startedAt) {
      this.stopwatch.restoreRunning(saved.elapsedMs || 0, saved.startedAt);
    } else {
      this.stopwatch.setElapsed(saved.elapsedMs || 0);
    }
  },

  persist() {
    if (!this.ready || !this.stopwatch || !this.roundsList) {
      return;
    }
    window.JapaDigitalSessionStore.save({
      rounds: this.roundsList.getRounds(),
      beadCount: this.beadCount,
      elapsedMs: this.stopwatch.isRunning()
        ? this.stopwatch.getAccumulatedMs()
        : this.stopwatch.getElapsed(),
      running: this.stopwatch.isRunning(),
      startedAt: this.stopwatch.getStartedAt(),
    });
  },

  syncUi() {
    if (this.beadValue) {
      this.beadValue.textContent = String(this.beadCount || 0);
    }
    if (this.timerDisplay && this.stopwatch) {
      this.timerDisplay.textContent = window.JapaTime.formatElapsed(
        this.stopwatch.getElapsed()
      );
    }
    this.syncProgress();
    if (
      window.JapaDigitalCounterFullscreen &&
      window.JapaDigitalCounterFullscreen.isOpen()
    ) {
      window.JapaDigitalCounterFullscreen.sync();
    }
  },

  syncProgress() {
    if (!this.roundProgress || !this.roundsList) {
      return;
    }
    const count = this.roundsList.getCount();
    this.roundProgress.textContent =
      count >= this.MAX_ROUNDS
        ? "16 / 16 complete"
        : count + " / " + this.MAX_ROUNDS + " complete";
  },

  onBeadPress() {
    if (!this.stopwatch || !this.roundsList) {
      this.ensureEngine();
    }

    if (!this.stopwatch.isRunning()) {
      this.stopwatch.start();
    }

    this.beadCount += 1;

    if (this.beadCount >= this.BEAD_MAX) {
      this.completeRound();
      return;
    }

    this.syncUi();
    this.persist();
  },

  completeRound() {
    const elapsed = this.stopwatch.reset();
    this.beadCount = 0;

    if (elapsed > 0 && this.roundsList.canAddRound()) {
      this.roundsList.addRound(elapsed);
    } else if (elapsed > 0 && !this.roundsList.canAddRound()) {
      window.alert("Maximum 16 rounds reached for Digital Counter.");
    }

    this.syncUi();
    this.persist();
  },

  startTimer() {
    this.stopwatch.start();
    this.persist();
  },

  stopTimer() {
    if (this.stopwatch.isRunning()) {
      this.stopwatch.stop();
      this.persist();
    }
  },

  /** Reset only bead counter + timer (does not save a round). */
  resetBeadAndTimer() {
    this.beadCount = 0;
    this.stopwatch.reset();
    this.syncUi();
    this.persist();
  },

  clearAll() {
    const hasProgress =
      this.roundsList.getCount() > 0 ||
      this.stopwatch.getElapsed() > 0 ||
      this.beadCount > 0;
    if (
      hasProgress &&
      !window.confirm("Clear Digital Counter rounds, beads, and timer?")
    ) {
      return;
    }
    this.beadCount = 0;
    this.stopwatch.reset();
    this.roundsList.clearRounds();
    this.syncUi();
    this.persist();
  },

  saveDay() {
    const rounds = this.roundsList.getRounds();
    if (rounds.length === 0) {
      window.alert(
        "No Digital Counter rounds to save yet. Complete at least one round of 108 first."
      );
      return;
    }

    const result = window.JapaDigitalResultsStore.upsertToday(rounds);
    if (!result.ok) {
      window.alert("Could not save Digital Counter day.");
      return;
    }

    window.alert(
      "Saved " +
        result.day.roundCount +
        " Digital Counting Chanting rounds for " +
        window.JapaTime.formatDateLabel(result.day.dateKey) +
        ". Open Result to review."
    );

    if (typeof this.onSaved === "function") {
      this.onSaved();
    }
  },

  onVisibilityHidden() {
    if (!this.stopwatch) {
      return;
    }
    this.stopwatch.suspendDisplay();
    this.persist();
  },

  onVisibilityVisible() {
    if (!this.stopwatch) {
      return;
    }
    this.stopwatch.resumeDisplay();
    this.syncUi();
    this.persist();
  },
};
