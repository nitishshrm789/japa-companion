/**
 * Pure stopwatch: tracks elapsed time with start / stop / reset.
 */
window.JapaStopwatch = {
  create(onTick) {
    let running = false;
    let accumulatedMs = 0;
    let startedAt = 0;
    let frameId = null;

    function now() {
      return performance.now();
    }

    function currentElapsed() {
      if (!running) {
        return accumulatedMs;
      }
      return accumulatedMs + (now() - startedAt);
    }

    function emit() {
      onTick(currentElapsed());
    }

    function tick() {
      emit();
      frameId = requestAnimationFrame(tick);
    }

    function start() {
      if (running) {
        return;
      }
      running = true;
      startedAt = now();
      frameId = requestAnimationFrame(tick);
      emit();
    }

    function stop() {
      if (!running) {
        return;
      }
      accumulatedMs = currentElapsed();
      running = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      emit();
    }

    function reset() {
      const elapsed = currentElapsed();
      running = false;
      accumulatedMs = 0;
      startedAt = 0;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      emit();
      return elapsed;
    }

    function getElapsed() {
      return currentElapsed();
    }

    function isRunning() {
      return running;
    }

    /**
     * Restore a paused elapsed time (e.g. after returning from other work).
     */
    function setElapsed(ms) {
      running = false;
      accumulatedMs = Math.max(0, ms || 0);
      startedAt = 0;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      emit();
    }

    return {
      start,
      stop,
      reset,
      getElapsed,
      isRunning,
      setElapsed,
    };
  },
};
