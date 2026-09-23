/**
 * Pure stopwatch: wall-clock timing so background / lock screen
 * does not freeze elapsed time (rAF only drives the display).
 * Hard cap: 16:00 — enough for one round; auto-stops at the limit.
 */
window.JapaStopwatch = {
  MAX_ELAPSED_MS: 16 * 60 * 1000,

  create(onTick) {
    const maxMs = window.JapaStopwatch.MAX_ELAPSED_MS;
    let running = false;
    let accumulatedMs = 0;
    let startedAt = 0;
    let frameId = null;

    function now() {
      return Date.now();
    }

    function clampMs(ms) {
      return Math.min(Math.max(0, ms || 0), maxMs);
    }

    function rawElapsed() {
      if (!running || !startedAt) {
        return accumulatedMs;
      }
      return accumulatedMs + (now() - startedAt);
    }

    function enforceCap() {
      const raw = rawElapsed();
      if (raw < maxMs) {
        return false;
      }
      accumulatedMs = maxMs;
      running = false;
      startedAt = 0;
      clearFrame();
      return true;
    }

    function currentElapsed() {
      enforceCap();
      return clampMs(rawElapsed());
    }

    function emit() {
      onTick(currentElapsed());
    }

    function clearFrame() {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    }

    function tick() {
      if (enforceCap()) {
        emit();
        return;
      }
      emit();
      frameId = requestAnimationFrame(tick);
    }

    function startDisplay() {
      if (frameId !== null || !running) {
        return;
      }
      frameId = requestAnimationFrame(tick);
    }

    function start() {
      if (running) {
        return;
      }
      if (accumulatedMs >= maxMs) {
        accumulatedMs = maxMs;
        emit();
        return;
      }
      running = true;
      startedAt = now();
      startDisplay();
      emit();
    }

    function stop() {
      if (!running) {
        accumulatedMs = clampMs(accumulatedMs);
        emit();
        return;
      }
      accumulatedMs = clampMs(rawElapsed());
      running = false;
      startedAt = 0;
      clearFrame();
      emit();
    }

    function reset() {
      const elapsed = currentElapsed();
      running = false;
      accumulatedMs = 0;
      startedAt = 0;
      clearFrame();
      emit();
      return elapsed;
    }

    function getElapsed() {
      return currentElapsed();
    }

    function isRunning() {
      enforceCap();
      return running;
    }

    function getStartedAt() {
      enforceCap();
      return running ? startedAt : 0;
    }

    function getAccumulatedMs() {
      enforceCap();
      return clampMs(accumulatedMs);
    }

    /**
     * Restore a paused elapsed time (e.g. after returning from other work).
     */
    function setElapsed(ms) {
      running = false;
      accumulatedMs = clampMs(ms);
      startedAt = 0;
      clearFrame();
      emit();
    }

    /**
     * Continue a run that was already in progress (survives tab close / lock).
     * If wall time already passed 16:00, stay paused at the cap.
     */
    function restoreRunning(baseMs, startedAtWall) {
      accumulatedMs = clampMs(baseMs);
      startedAt =
        typeof startedAtWall === "number" && startedAtWall > 0
          ? startedAtWall
          : now();
      running = true;
      if (enforceCap()) {
        emit();
        return;
      }
      startDisplay();
      emit();
    }

    /** Pause display loop only — keep counting via wall clock. */
    function suspendDisplay() {
      clearFrame();
    }

    /** Resume display loop if still running; enforce 16:00 cap first. */
    function resumeDisplay() {
      if (enforceCap()) {
        emit();
        return;
      }
      if (running) {
        emit();
        startDisplay();
      }
    }

    return {
      start,
      stop,
      reset,
      getElapsed,
      isRunning,
      setElapsed,
      restoreRunning,
      getStartedAt,
      getAccumulatedMs,
      suspendDisplay,
      resumeDisplay,
      maxElapsedMs: maxMs,
    };
  },
};
