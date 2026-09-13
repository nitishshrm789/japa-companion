/**
 * Persists Digital Counter session (beads, timer, rounds) on this device.
 */
window.JapaDigitalSessionStore = {
  KEY: "japa-digital-counter-session-v1",
  BEAD_MAX: 108,
  MAX_ROUNDS: 16,

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) {
        return null;
      }
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.rounds)) {
        return null;
      }

      const rounds = data.rounds.filter(function (round) {
        return (
          round &&
          typeof round.id === "string" &&
          typeof round.elapsedMs === "number" &&
          round.elapsedMs > 0
        );
      }).slice(0, this.MAX_ROUNDS);

      const beadCount =
        typeof data.beadCount === "number"
          ? Math.max(0, Math.min(this.BEAD_MAX - 1, Math.floor(data.beadCount)))
          : 0;

      return {
        rounds: rounds,
        beadCount: beadCount,
        elapsedMs:
          typeof data.elapsedMs === "number" && data.elapsedMs > 0
            ? data.elapsedMs
            : 0,
        running: Boolean(data.running),
        startedAt: typeof data.startedAt === "number" ? data.startedAt : 0,
      };
    } catch (error) {
      return null;
    }
  },

  save(payload) {
    try {
      localStorage.setItem(
        this.KEY,
        JSON.stringify({
          rounds: payload.rounds || [],
          beadCount: Math.max(0, payload.beadCount || 0),
          elapsedMs: Math.max(0, payload.elapsedMs || 0),
          running: Boolean(payload.running),
          startedAt: Math.max(0, payload.startedAt || 0),
          updatedAt: Date.now(),
        })
      );
    } catch (error) {
      // Ignore quota / private-mode write failures.
    }
  },

  clear() {
    try {
      localStorage.removeItem(this.KEY);
    } catch (error) {
      // Ignore.
    }
  },
};
