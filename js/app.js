(function bootJapaApp() {
  const MAX_ROUNDS = window.JapaRounds.MAX_ROUNDS;

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

  let sessionReady = false;
  let progressText = "Saved 0 / 16";

  function updateProgress(count) {
    if (count >= MAX_ROUNDS) {
      progressText = "16 / 16 complete";
    } else {
      progressText = "Saved " + count + " / " + MAX_ROUNDS;
    }
    roundProgress.textContent = progressText;
    window.JapaTimerFullscreen.sync();
  }

  function persistSession() {
    if (!sessionReady) {
      return;
    }
    window.JapaSessionStore.save(
      roundsList.getRounds(),
      stopwatch.getElapsed()
    );
  }

  function refreshResults() {
    window.JapaResultsPanel.render(resultRoot);
  }

  const roundsList = window.JapaRounds.create(
    roundsListEl,
    roundsEmptyEl,
    function onRoundsChange(count) {
      updateProgress(count);
      persistSession();
    }
  );

  const stopwatch = window.JapaStopwatch.create(function onTick(elapsedMs) {
    const text = window.JapaTime.formatElapsed(elapsedMs);
    timerDisplay.textContent = text;
    window.JapaTimerFullscreen.sync();
  });

  function pauseAndSave() {
    if (stopwatch.isRunning()) {
      stopwatch.stop();
    }
    persistSession();
  }

  function startTimer() {
    if (!roundsList.canAddRound() && stopwatch.getElapsed() === 0) {
      return;
    }
    stopwatch.start();
    persistSession();
  }

  function resetRound() {
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

  // Restore unfinished session (e.g. left mid-day for other work).
  const saved = window.JapaSessionStore.load();
  if (saved) {
    roundsList.setRounds(saved.rounds);
    stopwatch.setElapsed(saved.currentElapsedMs);
  }

  sessionReady = true;
  persistSession();

  window.JapaTimerFullscreen.init({
    getElapsed: function () {
      return stopwatch.getElapsed();
    },
    getProgressText: function () {
      return progressText;
    },
    onStart: startTimer,
    onStop: pauseAndSave,
    onReset: resetRound,
  });

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

  function openTimerFullscreen(event) {
    if (event.target.closest("button")) {
      return;
    }
    window.JapaTimerFullscreen.open();
  }

  timerPanel.addEventListener("click", openTimerFullscreen);
  roundsPanel.addEventListener("click", openTimerFullscreen);

  timerPanel.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.JapaTimerFullscreen.open();
    }
  });

  roundsPanel.addEventListener("keydown", function (event) {
    if (event.target.closest("button")) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.JapaTimerFullscreen.open();
    }
  });

  btnStart.addEventListener("click", startTimer);
  btnStop.addEventListener("click", pauseAndSave);
  btnReset.addEventListener("click", resetRound);

  btnClearSession.addEventListener("click", function (event) {
    event.stopPropagation();

    const hasProgress =
      roundsList.getCount() > 0 || stopwatch.getElapsed() > 0;

    if (
      hasProgress &&
      !window.confirm("Clear saved rounds and timer? Start a fresh session?")
    ) {
      return;
    }

    stopwatch.reset();
    roundsList.clearRounds();
    window.JapaSessionStore.clear();
    persistSession();
  });

  btnSaveDay.addEventListener("click", function () {
    const rounds = roundsList.getRounds();
    if (rounds.length === 0) {
      window.alert("No rounds to save yet. Complete at least one round first.");
      return;
    }

    const result = window.JapaResultsStore.upsertToday(rounds);
    if (!result.ok) {
      window.alert("Could not save today's progress.");
      return;
    }

    refreshResults();
    window.alert(
      "Saved " +
        result.day.roundCount +
        " rounds for " +
        window.JapaTime.formatDateLabel(result.day.dateKey) +
        ". Open the Result tab to review."
    );
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      pauseAndSave();
    }
  });

  window.addEventListener("pagehide", pauseAndSave);
})();
