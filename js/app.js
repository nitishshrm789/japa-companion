(function bootJapaApp() {
  const MAX_ROUNDS = window.JapaRounds.MAX_ROUNDS;

  const timerDisplay = document.getElementById("timer-display");
  const roundProgress = document.getElementById("round-progress");
  const btnStart = document.getElementById("btn-start");
  const btnStop = document.getElementById("btn-stop");
  const btnReset = document.getElementById("btn-reset");
  const btnClearSession = document.getElementById("btn-clear-session");
  const roundsListEl = document.getElementById("rounds-list");
  const roundsEmptyEl = document.getElementById("rounds-empty");

  let sessionReady = false;

  function updateProgress(count) {
    if (count >= MAX_ROUNDS) {
      roundProgress.textContent = "16 / 16 complete";
      return;
    }
    roundProgress.textContent = `Saved ${count} / ${MAX_ROUNDS}`;
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

  const roundsList = window.JapaRounds.create(
    roundsListEl,
    roundsEmptyEl,
    function onRoundsChange(count) {
      updateProgress(count);
      persistSession();
    }
  );

  const stopwatch = window.JapaStopwatch.create(function onTick(elapsedMs) {
    timerDisplay.textContent = window.JapaTime.formatElapsed(elapsedMs);
  });

  function pauseAndSave() {
    if (stopwatch.isRunning()) {
      stopwatch.stop();
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

  window.JapaTabs.init({ initialTab: "clock" });

  try {
    window.JapaReadViewer.init();
    window.JapaPhotoViewer.init();
    window.JapaReadPanel.render(document.getElementById("read-root"));
    window.JapaMantraPanel.render(document.getElementById("mm-root"));
    window.JapaPhotosPanel.render(document.getElementById("photos-root"));
  } catch (error) {
    console.error("Reading panels failed to load:", error);
  }

  btnStart.addEventListener("click", function () {
    if (!roundsList.canAddRound() && stopwatch.getElapsed() === 0) {
      return;
    }
    stopwatch.start();
    persistSession();
  });

  btnStop.addEventListener("click", function () {
    pauseAndSave();
  });

  btnReset.addEventListener("click", function () {
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
  });

  btnClearSession.addEventListener("click", function () {
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

  // Auto-pause + save when leaving the tab/app for other work.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      pauseAndSave();
    }
  });

  window.addEventListener("pagehide", pauseAndSave);
})();
