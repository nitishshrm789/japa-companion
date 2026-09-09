/**
 * Pure stopwatch: wall-clock timing so background / lock screen
 * does not freeze elapsed time (rAF only drives the display).
 */
window.JapaStopwatch = {
  create(onTick) {
    let running = false;
    let accumulatedMs = 0;
    let startedAt = 0;
    let frameId = null;

    function now() {
      return Date.now();
    }

    function currentElapsed() {
      if (!running || !startedAt) {
        return accumulatedMs;
      }
      return accumulatedMs + (now() - startedAt);
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
      running = true;
      startedAt = now();
      startDisplay();
      emit();
    }

    function stop() {
      if (!running) {
        return;
      }
      accumulatedMs = currentElapsed();
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
      return running;
    }

    function getStartedAt() {
      return running ? startedAt : 0;
    }

    function getAccumulatedMs() {
      return accumulatedMs;
    }

    /**
     * Restore a paused elapsed time (e.g. after returning from other work).
     */
    function setElapsed(ms) {
      running = false;
      accumulatedMs = Math.max(0, ms || 0);
      startedAt = 0;
      clearFrame();
      emit();
    }

    /**
     * Continue a run that was already in progress (survives tab close / lock).
     */
    function restoreRunning(baseMs, startedAtWall) {
      accumulatedMs = Math.max(0, baseMs || 0);
      startedAt =
        typeof startedAtWall === "number" && startedAtWall > 0
          ? startedAtWall
          : now();
      running = true;
      startDisplay();
      emit();
    }

    /** Pause display loop only — keep counting via wall clock. */
    function suspendDisplay() {
      clearFrame();
    }

    /** Resume display loop if still running. */
    function resumeDisplay() {
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
    };
  },
};
