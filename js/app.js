(function bootJapaApp() {
  const MAX_ROUNDS = window.JapaRounds.MAX_ROUNDS;
  const EXTRA_START = window.JapaRounds.EXTRA_START;

  const timerDisplay = document.getElementById("timer-display");
  const roundProgress = document.getElementById("round-progress");
  const btnStart = document.getElementById("btn-start");
  const btnStop = document.getElementById("btn-stop");
  const btnReset = document.getElementById("btn-reset");
  const btnClearSession = document.getElementById("btn-clear-session");
  const btnSaveDay = document.getElementById("btn-save-day");
  const roundsListEl = document.getElementById("rounds-list");
  const roundsEmptyEl = document.getElementById("rounds-empty");
  const timerPanel = document.getElementById("timer-panel");
  const roundsPanel = document.getElementById("rounds-panel");
  const resultRoot = document.getElementById("result-root");

  const extraTimerDisplay = document.getElementById("extra-timer-display");
  const extraRoundProgress = document.getElementById("extra-round-progress");
  const btnExtraStart = document.getElementById("btn-extra-start");
  const btnExtraStop = document.getElementById("btn-extra-stop");
  const btnExtraReset = document.getElementById("btn-extra-reset");
  const btnExtraClear = document.getElementById("btn-extra-clear");
  const btnExtraSaveDay = document.getElementById("btn-extra-save-day");
  const extraRoundsListEl = document.getElementById("extra-rounds-list");
  const extraRoundsEmptyEl = document.getElementById("extra-rounds-empty");
  const extraTimerPanel = document.getElementById("extra-timer-panel");
  const extraRoundsPanel = document.getElementById("extra-rounds-panel");

  let sessionReady = false;
  let progressText = "Saved 0 / 16";
  let extraProgressText = "Extra rounds: 0";
  let timerUiReady = false;
  let activeFullscreen = "main";

  function refreshResults() {
    window.JapaResultsPanel.render(resultRoot);
  }

  function persistSession() {
    if (!sessionReady) {
      return;
    }
    window.JapaSessionStore.save({
      rounds: roundsList.getRounds(),
      currentElapsedMs: stopwatch.getElapsed(),
      extraRounds: extraRoundsList.getRounds(),
      extraElapsedMs: extraStopwatch.getElapsed(),
    });
  }

  function updateProgress(count) {
    if (count >= MAX_ROUNDS) {
      progressText = "16 / 16 complete";
    } else {
      progressText = "Saved " + count + " / " + MAX_ROUNDS;
    }
    roundProgress.textContent = progressText;
    if (timerUiReady && activeFullscreen === "main") {
      window.JapaTimerFullscreen.sync();
    }
  }

  function updateExtraProgress(count) {
    extraProgressText =
      count === 0
        ? "Extra rounds: 0"
        : "Extra rounds: " +
          count +
          " (Round " +
          EXTRA_START +
          "–" +
          (EXTRA_START + count - 1) +
          ")";
    extraRoundProgress.textContent = extraProgressText;
    if (timerUiReady && activeFullscreen === "extra") {
      window.JapaTimerFullscreen.sync();
    }
  }

  const roundsList = window.JapaRounds.create(
    roundsListEl,
    roundsEmptyEl,
    function onRoundsChange(count) {
      updateProgress(count);
      persistSession();
    },
    { startNumber: 1, maxRounds: MAX_ROUNDS }
  );

  const extraRoundsList = window.JapaRounds.create(
    extraRoundsListEl,
    extraRoundsEmptyEl,
    function onExtraChange(count) {
      updateExtraProgress(count);
      persistSession();
    },
    { startNumber: EXTRA_START, maxRounds: Infinity }
  );

  const stopwatch = window.JapaStopwatch.create(function onTick(elapsedMs) {
    timerDisplay.textContent = window.JapaTime.formatElapsed(elapsedMs);
    if (timerUiReady && activeFullscreen === "main") {
      window.JapaTimerFullscreen.sync();
    }
  });

  const extraStopwatch = window.JapaStopwatch.create(function onTick(elapsedMs) {
    extraTimerDisplay.textContent = window.JapaTime.formatElapsed(elapsedMs);
    if (timerUiReady && activeFullscreen === "extra") {
      window.JapaTimerFullscreen.sync();
    }
  });

  function pauseMain() {
    if (stopwatch.isRunning()) {
      stopwatch.stop();
    }
    persistSession();
  }

  function pauseExtra() {
    if (extraStopwatch.isRunning()) {
      extraStopwatch.stop();
    }
    persistSession();
  }

  function startMain() {
    if (!roundsList.canAddRound() && stopwatch.getElapsed() === 0) {
      return;
    }
    pauseExtra();
    stopwatch.start();
    persistSession();
  }

  function startExtra() {
    pauseMain();
    extraStopwatch.start();
    persistSession();
  }

  function resetMain() {
    const elapsed = stopwatch.reset();
    if (elapsed <= 0) {
      persistSession();
      return;
    }
    if (!roundsList.canAddRound()) {
      persistSession();
      return;
    }
    roundsList.addRound(elapsed);
    if (roundsList.canAddRound()) {
      stopwatch.start();
    }
    persistSession();
  }

  function resetExtra() {
    const elapsed = extraStopwatch.reset();
    if (elapsed <= 0) {
      persistSession();
      return;
    }
    extraRoundsList.addRound(elapsed);
    extraStopwatch.start();
    persistSession();
  }

  function saveToday() {
    const main = roundsList.getRounds();
    const extra = extraRoundsList.getRounds();
    if (main.length === 0 && extra.length === 0) {
      window.alert("No rounds to save yet. Complete at least one round first.");
      return;
    }

    const result = window.JapaResultsStore.upsertToday(main, extra);
    if (!result.ok) {
      window.alert("Could not save today's progress.");
      return;
    }

    refreshResults();
    window.alert(
      "Saved " +
        result.day.roundCount +
        " rounds" +
        (result.day.extraCount
          ? " + " + result.day.extraCount + " extra"
          : "") +
        " for " +
        window.JapaTime.formatDateLabel(result.day.dateKey) +
        ". Open Result to review."
    );
  }

  const mainFsOptions = {
    getElapsed: function () {
      return stopwatch.getElapsed();
    },
    getProgressText: function () {
      return progressText;
    },
    onStart: startMain,
    onStop: pauseMain,
    onReset: resetMain,
  };

  const extraFsOptions = {
    getElapsed: function () {
      return extraStopwatch.getElapsed();
    },
    getProgressText: function () {
      return extraProgressText;
    },
    onStart: startExtra,
    onStop: pauseExtra,
    onReset: resetExtra,
  };

  const saved = window.JapaSessionStore.load();
  if (saved) {
    roundsList.setRounds(saved.rounds);
    stopwatch.setElapsed(saved.currentElapsedMs);
    extraRoundsList.setRounds(saved.extraRounds || []);
    extraStopwatch.setElapsed(saved.extraElapsedMs || 0);
  }

  sessionReady = true;
  persistSession();

  window.JapaTimerFullscreen.init(mainFsOptions);
  timerUiReady = true;

  window.JapaTabs.init({
    initialTab: "clock",
    onChange: function (name) {
      if (name === "result") {
        refreshResults();
      }
    },
  });

  try {
    window.JapaReadViewer.init();
    window.JapaPhotoViewer.init();
    window.JapaReadPanel.render(document.getElementById("read-root"));
    window.JapaMantraPanel.render(document.getElementById("mm-root"));
    window.JapaPhotosPanel.render(document.getElementById("photos-root"));
    refreshResults();
  } catch (error) {
    console.error("Panels failed to load:", error);
  }

  function openMainFullscreen(event) {
    if (event.target.closest("button")) {
      return;
    }
    activeFullscreen = "main";
    window.JapaTimerFullscreen.open(mainFsOptions);
  }

  function openExtraFullscreen(event) {
    if (event.target.closest("button")) {
      return;
    }
    activeFullscreen = "extra";
    window.JapaTimerFullscreen.open(extraFsOptions);
  }

  timerPanel.addEventListener("click", openMainFullscreen);
  roundsPanel.addEventListener("click", openMainFullscreen);
  extraTimerPanel.addEventListener("click", openExtraFullscreen);
  extraRoundsPanel.addEventListener("click", openExtraFullscreen);

  btnStart.addEventListener("click", startMain);
  btnStop.addEventListener("click", pauseMain);
  btnReset.addEventListener("click", resetMain);
  btnExtraStart.addEventListener("click", startExtra);
  btnExtraStop.addEventListener("click", pauseExtra);
  btnExtraReset.addEventListener("click", resetExtra);
  btnSaveDay.addEventListener("click", saveToday);
  btnExtraSaveDay.addEventListener("click", saveToday);

  btnClearSession.addEventListener("click", function (event) {
    event.stopPropagation();
    const hasProgress =
      roundsList.getCount() > 0 || stopwatch.getElapsed() > 0;
    if (
      hasProgress &&
      !window.confirm("Clear Clock rounds and timer?")
    ) {
      return;
    }
    stopwatch.reset();
    roundsList.clearRounds();
    persistSession();
  });

  btnExtraClear.addEventListener("click", function (event) {
    event.stopPropagation();
    const hasProgress =
      extraRoundsList.getCount() > 0 || extraStopwatch.getElapsed() > 0;
    if (
      hasProgress &&
      !window.confirm("Clear Extra rounds and timer?")
    ) {
      return;
    }
    extraStopwatch.reset();
    extraRoundsList.clearRounds();
    persistSession();
  });

  function pauseAllAndSave() {
    pauseMain();
    pauseExtra();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      pauseAllAndSave();
    }
  });

  window.addEventListener("pagehide", pauseAllAndSave);
})();
